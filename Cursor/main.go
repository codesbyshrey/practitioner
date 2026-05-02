package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/invopop/jsonschema"
)

// Agent is the core structure that holds everything our "agent" needs:
// - an Anthropic client to talk to Claude
// - a way to read user input (from stdin in this example)
// - a list of tool definitions that Claude can call
type Agent struct {
	client         *anthropic.Client
	getUserMessage func() (string, bool)
	tools          []ToolDefinition
}

// ToolDefinition describes a single tool the agent can expose to Claude.
// - Name / Description: what the tool is and when to use it
// - InputSchema: JSON schema describing the tool's input object
// - Function: Go function that actually executes the tool
type ToolDefinition struct {
	Name        string                         `json:"name"`
	Description string                         `json:"description"`
	InputSchema anthropic.ToolInputSchemaParam `json:"input_schema"`
	Function    func(input json.RawMessage) (string, error)
}

// NewAgent wires together a new Agent instance.
func NewAgent(
	client *anthropic.Client,
	getUserMessage func() (string, bool),
	tools []ToolDefinition,
) *Agent {
	return &Agent{
		client:         client,
		getUserMessage: getUserMessage,
		tools:          tools,
	}
}

// Run is the main loop:
// - keeps a running "conversation" slice of messages
// - alternates between reading user input and calling Claude
// - if Claude requests tool calls, executes them and feeds results back
func (a *Agent) Run(ctx context.Context) error {
	// This holds the entire conversation history that we send to Claude
	conversation := []anthropic.MessageParam{}

	fmt.Println("Chat with Claude (use 'ctrl-c' to quit)")

	// readUserInput controls whether to read from stdin in this loop iteration.
	// When tools are used, we skip user input and immediately send tool results
	// back to Claude instead, so it can keep reasoning without waiting.
	readUserInput := true

	for {
		if readUserInput {
			fmt.Print("\u001b[94mYou\u001b[0m: ")
			userInput, ok := a.getUserMessage()
			if !ok {
				// stdin closed, exit the loop
				break
			}

			// Wrap the raw string into an Anthropic "user" message with one text block
			userMessage := anthropic.NewUserMessage(
				anthropic.NewTextBlock(userInput),
			)
			conversation = append(conversation, userMessage)
		}

		// Ask Claude what to do next, given the whole conversation so far
		message, err := a.runInference(ctx, conversation)
		if err != nil {
			return err
		}
		conversation = append(conversation, message.ToParam())

		// Collect any tool results we produce in this turn
		toolResults := []anthropic.ContentBlockParamUnion{}

		// Claude's response can contain:
		// - plain text
		// - "tool_use" blocks that tell us to call a tool
		for _, content := range message.Content {
			switch content.Type {
			case "text":
				// Simple chat reply from Claude
				fmt.Printf("\u001b[93mClaude\u001b[0m: %s\n", content.Text)
			case "tool_use":
				// Claude is asking us to call a specific tool with JSON input
				result := a.executeTool(content.ID, content.Name, content.Input)
				toolResults = append(toolResults, result)
			}
		}

		// If there were no tool calls, go back to reading user input.
		if len(toolResults) == 0 {
			readUserInput = true
			continue
		}

		// If tools were used:
		// - don't read from stdin yet
		// - instead, send tool results back to Claude as a synthetic "user" message
		//   so it can keep thinking and possibly ask for more tools or respond.
		readUserInput = false
		conversation = append(conversation, anthropic.NewUserMessage(toolResults...))
	}

	return nil
}

// runInference sends the current conversation to Anthropic and returns Claude's reply.
func (a *Agent) runInference(ctx context.Context, conversation []anthropic.MessageParam) (*anthropic.Message, error) {
	// Convert our internal tool definitions into Anthropic tool descriptions
	anthropicTools := []anthropic.ToolUnionParam{}
	for _, tool := range a.tools {
		anthropicTools = append(anthropicTools, anthropic.ToolUnionParam{
			OfTool: &anthropic.ToolParam{
				Name:        tool.Name,
				Description: anthropic.String(tool.Description),
				InputSchema: tool.InputSchema,
			},
		})
	}

	// Ask Claude to respond, giving it:
	// - model
	// - max tokens for the reply
	// - full conversation history
	// - tools it is allowed to call
	message, err := a.client.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     anthropic.ModelClaude3_7SonnetLatest,
		MaxTokens: int64(1024),
		Messages:  conversation,
		Tools:     anthropicTools,
	})
	return message, err
}

// executeTool looks up the requested tool by name, runs it, and wraps the result
// in the form Anthropic expects ("tool_result" content block).
func (a *Agent) executeTool(id, name string, input json.RawMessage) anthropic.ContentBlockParamUnion {
	var toolDef ToolDefinition
	var found bool

	for _, tool := range a.tools {
		if tool.Name == name {
			toolDef = tool
			found = true
			break
		}
	}

	if !found {
		// Tool wasn't registered; tell Claude it failed
		return anthropic.NewToolResultBlock(id, "tool not found", true)
	}

	fmt.Printf("\u001b[92mtool\u001b[0m: %s(%s)\n", name, string(input))

	response, err := toolDef.Function(input)
	if err != nil {
		// Mark the tool call as errored; Claude will see this and can retry/adjust
		return anthropic.NewToolResultBlock(id, err.Error(), true)
	}

	// Successful tool execution
	return anthropic.NewToolResultBlock(id, response, false)
}

// ---------- Tool: read_file ----------

// ReadFileInput is the structured JSON input for the "read_file" tool.
type ReadFileInput struct {
	Path string `json:"path" jsonschema_description:"The relative path of a file in the working directory."`
}

// ReadFileInputSchema describes the JSON schema of ReadFileInput for Anthropic.
var ReadFileInputSchema = GenerateSchema[ReadFileInput]()

// ReadFileDefinition describes the "read_file" tool for Claude.
var ReadFileDefinition = ToolDefinition{
	Name:        "read_file",
	Description: "Read the contents of a given relative file path. Use this when you want to see what's inside a file. Do not use this with directory names.",
	InputSchema: ReadFileInputSchema,
	Function:    ReadFile,
}

// ReadFile reads the file specified in the JSON input and returns its contents.
func ReadFile(input json.RawMessage) (string, error) {
	readFileInput := ReadFileInput{}

	// Decode the tool input JSON into our struct
	if err := json.Unmarshal(input, &readFileInput); err != nil {
		// This is a programmer error (invalid schema / code), so panic is OK here
		panic(err)
	}

	content, err := os.ReadFile(readFileInput.Path)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

// ---------- Tool: list_files ----------

// ListFilesInput is the JSON input for the "list_files" tool.
// Path is optional; if empty, we list from the current directory.
type ListFilesInput struct {
	Path string `json:"path,omitempty" jsonschema_description:"Optional relative path to list files from. Defaults to current directory if not provided."`
}

// ListFilesInputSchema describes the JSON schema of ListFilesInput.
var ListFilesInputSchema = GenerateSchema[ListFilesInput]()

// ListFilesDefinition describes the "list_files" tool.
var ListFilesDefinition = ToolDefinition{
	Name:        "list_files",
	Description: "List files and directories at a given path. If no path is provided, lists files in the current directory.",
	InputSchema: ListFilesInputSchema,
	Function:    ListFiles,
}

// ListFiles walks the given directory and returns a JSON array of relative paths.
func ListFiles(input json.RawMessage) (string, error) {
	listFilesInput := ListFilesInput{}

	if err := json.Unmarshal(input, &listFilesInput); err != nil {
		panic(err)
	}

	dir := "."
	if listFilesInput.Path != "" {
		dir = listFilesInput.Path
	}

	var files []string

	// Walk collects all files and directories under the given directory
	err := filepath.Walk(dir, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(dir, p)
		if err != nil {
			return err
		}

		// Skip the root dir itself
		if relPath != "." {
			if info.IsDir() {
				files = append(files, relPath+"/")
			} else {
				files = append(files, relPath)
			}
		}
		return nil
	})

	if err != nil {
		return "", err
	}

	// Return a JSON-encoded list of paths, which is easy for Claude to read
	result, err := json.Marshal(files)
	if err != nil {
		return "", err
	}

	return string(result), nil
}

// ---------- Tool: edit_file ----------

// EditFileInput configures the "edit_file" tool.
// - Path: target file
// - OldStr: exact text to replace (can be empty to create new file)
// - NewStr: replacement text
type EditFileInput struct {
	Path   string `json:"path" jsonschema_description:"The path to the file"`
	OldStr string `json:"old_str" jsonschema_description:"Text to search for - must match exactly and must only have one match exactly"`
	NewStr string `json:"new_str" jsonschema_description:"Text to replace old_str with"`
}

// EditFileInputSchema describes the JSON schema for EditFileInput.
var EditFileInputSchema = GenerateSchema[EditFileInput]()

// EditFileDefinition describes the "edit_file" tool.
var EditFileDefinition = ToolDefinition{
	Name: "edit_file",
	Description: `Make edits to a text file.

Replaces 'old_str' with 'new_str' in the given file. 'old_str' and 'new_str' MUST be different from each other.

If the file specified with path doesn't exist, it will be created when old_str is empty.`,
	InputSchema: EditFileInputSchema,
	Function:    EditFile,
}

// EditFile updates or creates a text file according to EditFileInput.
func EditFile(input json.RawMessage) (string, error) {
	editFileInput := EditFileInput{}
	if err := json.Unmarshal(input, &editFileInput); err != nil {
		return "", err
	}

	// Basic validation to avoid nonsensical edits
	if editFileInput.Path == "" || editFileInput.OldStr == editFileInput.NewStr {
		return "", fmt.Errorf("invalid input parameters")
	}

	content, err := os.ReadFile(editFileInput.Path)
	if err != nil {
		// If file doesn't exist and OldStr is empty, create a brand new file
		if os.IsNotExist(err) && editFileInput.OldStr == "" {
			return createNewFile(editFileInput.Path, editFileInput.NewStr)
		}
		return "", err
	}

	oldContent := string(content)

	// Replace all occurrences of OldStr with NewStr
	newContent := strings.Replace(oldContent, editFileInput.OldStr, editFileInput.NewStr, -1)

	// If nothing changed but we expected to replace something, surface an error
	if oldContent == newContent && editFileInput.OldStr != "" {
		return "", fmt.Errorf("old_str not found in file")
	}

	if err := os.WriteFile(editFileInput.Path, []byte(newContent), 0o644); err != nil {
		return "", err
	}

	return "OK", nil
}

// createNewFile creates any needed parent directories and writes a new file.
func createNewFile(filePath, content string) (string, error) {
	dir := path.Dir(filePath)
	if dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return "", fmt.Errorf("failed to create directory: %w", err)
		}
	}

	if err := os.WriteFile(filePath, []byte(content), 0o644); err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}

	return fmt.Sprintf("Successfully created file %s", filePath), nil
}

// ---------- Helpers ----------

// GenerateSchema uses github.com/invopop/jsonschema to derive a JSON schema
// from a Go struct. We only need the "properties" field for Anthropic tools.
func GenerateSchema[T any]() anthropic.ToolInputSchemaParam {
	reflector := jsonschema.Reflector{
		AllowAdditionalProperties: false,
		DoNotReference:            true,
	}

	var v T
	schema := reflector.Reflect(v)

	return anthropic.ToolInputSchemaParam{
		// We let jsonschema derive the property definitions from the struct tags.
		Properties: schema.Properties,
	}
}

// ---------- main ----------

func main() {
	// Create an Anthropic client; it reads ANTHROPIC_API_KEY from the environment.
	client := anthropic.NewClient()

	// Scanner to read user input line-by-line from stdin.
	scanner := bufio.NewScanner(os.Stdin)

	// getUserMessage is a small closure that hides the scanner details.
	getUserMessage := func() (string, bool) {
		if !scanner.Scan() {
			return "", false
		}
		return scanner.Text(), true
	}

	// Register the tools we want to expose to Claude.
	tools := []ToolDefinition{
		ReadFileDefinition,
		ListFilesDefinition,
		EditFileDefinition,
	}

	// Build the agent.
	agent := NewAgent(client, getUserMessage, tools)

	// Run the main loop.
	if err := agent.Run(context.Background()); err != nil {
		fmt.Printf("Error: %s\n", err.Error())
	}
}

