package com.example.agent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.*;

/**
 * Minimal Java implementation of the same code-editing agent.
 *
 * Conceptually identical to the Go / Python / JS versions:
 * - keep an in-memory "conversation" list of messages
 * - describe tools with JSON Schemas (input_schema) and names/descriptions
 * - let Claude emit tool_use blocks, execute them locally, and respond with tool_result
 *
 * This version uses:
 * - OkHttp for HTTP calls to the Claude Messages API
 * - Jackson for building/parsing JSON and JSON Schemas
 */
public class JavaAgent {

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-3-7-sonnet-latest";

    private final OkHttpClient httpClient;
    private final ObjectMapper mapper;
    private final String apiKey;
    private final List<ToolDefinition> tools;

    public JavaAgent(String apiKey, List<ToolDefinition> tools) {
        this.httpClient = new OkHttpClient();
        this.mapper = new ObjectMapper();
        this.apiKey = apiKey;
        this.tools = tools;
    }

    public static void main(String[] args) throws IOException {
        String apiKey = System.getenv("ANTHROPIC_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("ANTHROPIC_API_KEY is not set.");
            System.exit(1);
        }

        ObjectMapper mapper = new ObjectMapper();

        List<ToolDefinition> tools = new ArrayList<>();
        tools.add(new ToolDefinition(
                "read_file",
                "Read the contents of a given relative file path. Use this when you want to see what's inside a file. Do not use this with directory names.",
                createReadFileSchema(mapper),
                JavaAgent::readFileTool
        ));
        tools.add(new ToolDefinition(
                "list_files",
                "List files and directories at a given path. If no path is provided, lists files in the current directory.",
                createListFilesSchema(mapper),
                JavaAgent::listFilesTool
        ));
        tools.add(new ToolDefinition(
                "edit_file",
                "Make edits to a text file. Replaces 'old_str' with 'new_str' in the given file. If the file doesn't exist and old_str is empty, it will be created.",
                createEditFileSchema(mapper),
                JavaAgent::editFileTool
        ));

        JavaAgent agent = new JavaAgent(apiKey, tools);
        agent.run();
    }

    /**
     * Main chat loop: read user input, send to Claude, execute tools if requested.
     */
    public void run() throws IOException {
        List<JsonNode> conversation = new ArrayList<>();

        System.out.println("Chat with Claude (use Ctrl+C to quit)");
        Scanner scanner = new Scanner(System.in, StandardCharsets.UTF_8);

        boolean readUserInput = true;

        while (true) {
            if (readUserInput) {
                System.out.print("\u001B[94mYou\u001B[0m: ");
                if (!scanner.hasNextLine()) {
                    break;
                }
                String line = scanner.nextLine();

                ObjectNode userMessage = mapper.createObjectNode();
                userMessage.put("role", "user");
                ArrayNode content = mapper.createArrayNode();
                ObjectNode textBlock = mapper.createObjectNode();
                textBlock.put("type", "text");
                textBlock.put("text", line);
                content.add(textBlock);
                userMessage.set("content", content);

                conversation.add(userMessage);
            }

            JsonNode message = runInference(conversation);

            ObjectNode assistantMessage = mapper.createObjectNode();
            assistantMessage.put("role", "assistant");
            assistantMessage.set("content", message.get("content"));
            conversation.add(assistantMessage);

            List<JsonNode> toolResults = new ArrayList<>();
            for (JsonNode block : message.get("content")) {
                String type = block.get("type").asText();
                if ("text".equals(type)) {
                    System.out.printf("\u001B[93mClaude\u001B[0m: %s%n", block.get("text").asText());
                } else if ("tool_use".equals(type)) {
                    JsonNode resultBlock = executeTool(block);
                    toolResults.add(resultBlock);
                }
            }

            if (toolResults.isEmpty()) {
                readUserInput = true;
                continue;
            }

            readUserInput = false;

            ObjectNode toolResultMessage = mapper.createObjectNode();
            toolResultMessage.put("role", "user");
            ArrayNode content = mapper.createArrayNode();
            for (JsonNode tr : toolResults) {
                content.add(tr);
            }
            toolResultMessage.set("content", content);
            conversation.add(toolResultMessage);
        }
    }

    /**
     * Call the Claude Messages API with conversation and tools.
     */
    private JsonNode runInference(List<JsonNode> conversation) throws IOException {
        ObjectNode payload = mapper.createObjectNode();
        payload.put("model", MODEL);
        payload.put("max_tokens", 1024);

        ArrayNode messagesNode = mapper.createArrayNode();
        for (JsonNode msg : conversation) {
            messagesNode.add(msg);
        }
        payload.set("messages", messagesNode);

        ArrayNode toolsNode = mapper.createArrayNode();
        for (ToolDefinition t : tools) {
            ObjectNode toolNode = mapper.createObjectNode();
            toolNode.put("name", t.name());
            toolNode.put("description", t.description());
            toolNode.set("input_schema", t.inputSchema());
            toolsNode.add(toolNode);
        }
        payload.set("tools", toolsNode);

        RequestBody body = RequestBody.create(
                mapper.writeValueAsString(payload),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(API_URL)
                .post(body)
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }
            String respBody = Objects.requireNonNull(response.body()).string();
            return mapper.readTree(respBody);
        }
    }

    /**
     * Execute a tool_use block and return a tool_result content block.
     */
    private JsonNode executeTool(JsonNode block) {
        String name = block.get("name").asText();
        JsonNode input = block.get("input");
        String id = block.get("id").asText();

        ToolDefinition tool = tools.stream()
                .filter(t -> t.name().equals(name))
                .findFirst()
                .orElse(null);

        ObjectNode resultBlock = mapper.createObjectNode();
        resultBlock.put("type", "tool_result");
        resultBlock.put("tool_use_id", id);

        if (tool == null) {
            resultBlock.put("content", "tool not found");
            resultBlock.put("is_error", true);
            return resultBlock;
        }

        System.out.printf("\u001B[92mtool\u001B[0m: %s(%s)%n", name, input.toString());

        try {
            String result = tool.function().apply(input);
            resultBlock.put("content", result);
            resultBlock.put("is_error", false);
        } catch (Exception e) {
            resultBlock.put("content", e.toString());
            resultBlock.put("is_error", true);
        }

        return resultBlock;
    }

    // ---------- Tool implementations ----------

    private static String readFileTool(JsonNode input) throws IOException {
        String path = input.get("path").asText();
        return Files.readString(Path.of(path), StandardCharsets.UTF_8);
    }

    private static String listFilesTool(JsonNode input) throws IOException {
        String basePath = input.has("path") && !input.get("path").isNull()
                ? input.get("path").asText()
                : ".";

        List<String> files = new ArrayList<>();

        Files.walk(Path.of(basePath))
                .forEach(p -> {
                    if (p.equals(Path.of(basePath))) {
                        return;
                    }
                    Path rel = Path.of(basePath).relativize(p);
                    File f = p.toFile();
                    if (f.isDirectory()) {
                        files.add(rel.toString() + "/");
                    } else {
                        files.add(rel.toString());
                    }
                });

        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(files);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private static String editFileTool(JsonNode input) throws IOException {
        String filePath = input.get("path").asText();
        String oldStr = input.get("old_str").asText("");
        String newStr = input.get("new_str").asText("");

        if (filePath.isEmpty() || oldStr.equals(newStr)) {
            throw new IllegalArgumentException("invalid input parameters");
        }

        Path path = Path.of(filePath);
        if (!Files.exists(path)) {
            if (!oldStr.isEmpty()) {
                throw new IOException("File not found: " + filePath);
            }
            return createNewFile(path, newStr);
        }

        String content = Files.readString(path, StandardCharsets.UTF_8);
        String newContent;

        if (!oldStr.isEmpty()) {
            newContent = content.replace(oldStr, newStr);
            if (newContent.equals(content)) {
                throw new IllegalArgumentException("old_str not found in file");
            }
        } else {
            newContent = newStr;
        }

        Files.writeString(path, newContent, StandardCharsets.UTF_8, StandardOpenOption.TRUNCATE_EXISTING);
        return "OK";
    }

    private static String createNewFile(Path path, String content) throws IOException {
        Path parent = path.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
        Files.writeString(path, content, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        return "Successfully created file " + path;
    }

    // ---------- Tool schemas ----------

    private static ObjectNode createReadFileSchema(ObjectMapper mapper) {
        ObjectNode schema = mapper.createObjectNode();
        schema.put("type", "object");

        ObjectNode props = mapper.createObjectNode();
        ObjectNode path = mapper.createObjectNode();
        path.put("type", "string");
        path.put("description", "The relative path of a file in the working directory.");
        props.set("path", path);
        schema.set("properties", props);

        ArrayNode required = mapper.createArrayNode();
        required.add("path");
        schema.set("required", required);

        schema.put("additionalProperties", false);
        return schema;
    }

    private static ObjectNode createListFilesSchema(ObjectMapper mapper) {
        ObjectNode schema = mapper.createObjectNode();
        schema.put("type", "object");

        ObjectNode props = mapper.createObjectNode();
        ObjectNode path = mapper.createObjectNode();
        path.put("type", "string");
        path.put("description", "Optional relative path to list files from. Defaults to current directory.");
        props.set("path", path);
        schema.set("properties", props);

        schema.set("required", mapper.createArrayNode());
        schema.put("additionalProperties", false);
        return schema;
    }

    private static ObjectNode createEditFileSchema(ObjectMapper mapper) {
        ObjectNode schema = mapper.createObjectNode();
        schema.put("type", "object");

        ObjectNode props = mapper.createObjectNode();

        ObjectNode path = mapper.createObjectNode();
        path.put("type", "string");
        path.put("description", "The path to the file.");
        props.set("path", path);

        ObjectNode oldStr = mapper.createObjectNode();
        oldStr.put("type", "string");
        oldStr.put("description", "Text to search for - must match exactly and must only have one match exactly.");
        props.set("old_str", oldStr);

        ObjectNode newStr = mapper.createObjectNode();
        newStr.put("type", "string");
        newStr.put("description", "Text to replace old_str with.");
        props.set("new_str", newStr);

        schema.set("properties", props);

        ArrayNode required = mapper.createArrayNode();
        required.add("path");
        required.add("old_str");
        required.add("new_str");
        schema.set("required", required);

        schema.put("additionalProperties", false);
        return schema;
    }

    // ---------- Helper types ----------

    record ToolDefinition(String name, String description, ObjectNode inputSchema,
                          java.util.function.Function<JsonNode, String> function) {
    }
}

