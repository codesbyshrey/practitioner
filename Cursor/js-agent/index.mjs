// Terminal-based code-editing agent implemented in Node.js (ESM).
//
// This mirrors the Go and Python examples:
// - maintain a `conversation` array of { role, content } messages
// - provide a list of tools with JSON Schemas as `input_schema`
// - let Claude emit `tool_use` blocks, execute them here, and reply with `tool_result`.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";

// Simple description of a tool that Claude can call.
class ToolDefinition {
  constructor(name, description, inputSchema, func) {
    this.name = name;
    this.description = description;
    this.inputSchema = inputSchema;
    this.func = func;
  }
}

// Core agent: maintains the conversation, exposes tools, and runs the loop.
class Agent {
  constructor(client, tools) {
    this.client = client;
    this.tools = tools;
  }

  async run() {
    const conversation = [];

    console.log("Chat with Claude (use Ctrl+C to quit)");
    const stdin = process.stdin;
    stdin.setEncoding("utf8");

    let buffer = "";
    let readUserInput = true;

    stdin.on("data", async (chunk) => {
      buffer += chunk;
      if (!buffer.includes("\n")) return;

      if (!readUserInput) {
        // Ignore extra input while Claude is still thinking/using tools
        buffer = "";
        return;
      }

      const line = buffer.trimEnd();
      buffer = "";

      process.stdout.write("\x1b[94mYou\x1b[0m: ");

      const userInput = line.replace(/\r?\n$/, "");
      if (userInput.length === 0) {
        return;
      }

      conversation.push({
        role: "user",
        content: [{ type: "text", text: userInput }],
      });

      readUserInput = false;
      await this._loop(conversation, () => {
        readUserInput = true;
        process.stdout.write(""); // noop to flush any pending output
      });
    });

    process.stdout.write("\x1b[94mYou\x1b[0m: ");
  }

  async _loop(conversation, onDone) {
    while (true) {
      const message = await this._runInference(conversation);
      conversation.push({
        role: "assistant",
        content: message.content,
      });

      const toolResults = [];
      for (const block of message.content) {
        if (block.type === "text") {
          console.log(`\x1b[93mClaude\x1b[0m: ${block.text}`);
        } else if (block.type === "tool_use") {
          const resultBlock = await this._executeTool(block);
          toolResults.push(resultBlock);
        }
      }

      if (toolResults.length === 0) {
        onDone();
        return;
      }

      conversation.push({
        role: "user",
        content: toolResults,
      });
    }
  }

  async _runInference(conversation) {
    const toolsPayload = this.tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema,
    }));

    return await this.client.messages.create({
      model: "claude-3-7-sonnet-latest",
      max_tokens: 1024,
      tools: toolsPayload,
      messages: conversation,
    });
  }

  async _executeTool(block) {
    const { id, name, input } = block;
    const tool = this.tools.find((t) => t.name === name);
    if (!tool) {
      return {
        type: "tool_result",
        tool_use_id: id,
        content: "tool not found",
        is_error: true,
      };
    }

    console.log(`\x1b[92mtool\x1b[0m: ${name}(${JSON.stringify(input)})`);

    try {
      const result = await tool.func(input);
      return {
        type: "tool_result",
        tool_use_id: id,
        content: result,
        is_error: false,
      };
    } catch (err) {
      return {
        type: "tool_result",
        tool_use_id: id,
        content: String(err),
        is_error: true,
      };
    }
  }
}

// ---------- Tools ----------

function readFileTool(input) {
  const filePath = input.path;
  if (!filePath) {
    throw new Error("path is required");
  }
  return fs.readFileSync(filePath, "utf8");
}

const READ_FILE_SCHEMA = {
  type: "object",
  properties: {
    path: {
      type: "string",
      description: "The relative path of a file in the working directory.",
    },
  },
  required: ["path"],
  additionalProperties: false,
};

function listFilesTool(input) {
  const baseDir = input.path || ".";
  const files = [];

  function walk(currentDir, relativeBase) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath =
        relativeBase === "."
          ? entry.name
          : path.join(relativeBase, entry.name);
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        files.push(relPath + "/");
        walk(fullPath, relPath);
      } else {
        files.push(relPath);
      }
    }
  }

  walk(baseDir, ".");
  return JSON.stringify(files);
}

const LIST_FILES_SCHEMA = {
  type: "object",
  properties: {
    path: {
      type: "string",
      description:
        "Optional relative path to list files from. Defaults to current directory.",
    },
  },
  required: [],
  additionalProperties: false,
};

function editFileTool(input) {
  const filePath = input.path;
  const oldStr = input.old_str ?? "";
  const newStr = input.new_str ?? "";

  if (!filePath || oldStr === newStr) {
    throw new Error("invalid input parameters");
  }

  if (!fs.existsSync(filePath)) {
    if (oldStr !== "") {
      throw new Error(`File not found: ${filePath}`);
    }
    return createNewFile(filePath, newStr);
  }

  const content = fs.readFileSync(filePath, "utf8");
  let newContent;

  if (oldStr) {
    newContent = content.split(oldStr).join(newStr);
    if (newContent === content) {
      throw new Error("old_str not found in file");
    }
  } else {
    newContent = newStr;
  }

  fs.writeFileSync(filePath, newContent, "utf8");
  return "OK";
}

function createNewFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (dir && dir !== ".") {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, "utf8");
  return `Successfully created file ${filePath}`;
}

const EDIT_FILE_SCHEMA = {
  type: "object",
  properties: {
    path: {
      type: "string",
      description: "The path to the file.",
    },
    old_str: {
      type: "string",
      description:
        "Text to search for - must match exactly and must only have one match exactly.",
    },
    new_str: {
      type: "string",
      description: "Text to replace old_str with.",
    },
  },
  required: ["path", "old_str", "new_str"],
  additionalProperties: false,
};

// ---------- main ----------

async function main() {
  const client = new Anthropic();

  const tools = [
    new ToolDefinition(
      "read_file",
      "Read the contents of a given relative file path. Use this when you want to see what's inside a file. Do not use this with directory names.",
      READ_FILE_SCHEMA,
      readFileTool,
    ),
    new ToolDefinition(
      "list_files",
      "List files and directories at a given path. If no path is provided, lists files in the current directory.",
      LIST_FILES_SCHEMA,
      listFilesTool,
    ),
    new ToolDefinition(
      "edit_file",
      "Make edits to a text file. Replaces 'old_str' with 'new_str' in the given file. If the file doesn't exist and old_str is empty, it will be created.",
      EDIT_FILE_SCHEMA,
      editFileTool,
    ),
  ];

  const agent = new Agent(client, tools);
  await agent.run();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

