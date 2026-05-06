# Cursor

Agent and IDE experiments spanning Python, Go, Java, and JavaScript implementations.

## Contents

- `java-agent`: Java agent experiment under Cursor.
- `js-agent`: JavaScript agent experiment under Cursor.

## Revisit Notes

- Python dependency metadata is present in `requirements.txt`.
- Go module metadata is present in `go.mod`.
- Static frontend entrypoint `index.html` is present.
- `index.html`, `script.js`, and `styles.css` form the memory-card game generated during Cursor/agent experimentation.

## Original README

# Multi-Language Code-Editing Agent

This project is a small, fully functional **code-editing agent** implemented in **Go, Python, JavaScript (Node), and Java**, inspired by the Amp blog post “How to Build an Agent”. Each implementation connects to Anthropic’s Claude models and exposes tools to **read, list, and edit files on your local filesystem**, so you can collaborate with Claude directly on your codebase from the terminal.

### What the Agent Does (Common Across Languages)

- **Interactive chat loop**:
  - Maintains a full conversation history with Claude.
  - Lets you talk to Claude in your terminal (question/answer style).
- **Tool-enabled “agent” behavior**:
  - Claude can decide when to call tools to inspect or modify your files.
  - Tool calls are executed by your local code, and results are fed back so Claude can continue reasoning.
- **Supported tools**:
  - **`read_file`**: Read the contents of a given file path.
  - **`list_files`**: Recursively list files and directories from a given starting path.
  - **`edit_file`**: Replace text inside a file or create a new file (including parent directories) when appropriate.

In practice, this lets Claude:

- Explore your project (`list_files`)
- Open specific files to inspect code (`read_file`)
- Apply modifications or create new files (`edit_file`)

All edits happen on your local machine; the agent just orchestrates between your terminal, your filesystem, and the Anthropic API.

### Conceptual Flow (Pseudocode)

Regardless of language, the core loop looks like this:

```text
tools = [read_file, list_files, edit_file]
conversation = []

print("Chat with Claude...")

loop:
  if expecting_user_input:
    user_text = read_line_from_stdin()
    conversation.append({ role: "user", content: [text_block(user_text)] })

  message = call_claude_api(
    model = "claude-3-7-sonnet-latest",
    messages = conversation,
    tools = tools_as_json_schemas
  )

  conversation.append({ role: "assistant", content: message.content })

  tool_results = []
  for block in message.content:
    if block.type == "text":
      print("Claude:", block.text)
    if block.type == "tool_use":
      result = execute_named_tool(block.name, block.input)
      tool_results.append(tool_result_block(block.id, result))

  if tool_results is empty:
    expecting_user_input = true
  else:
    expecting_user_input = false
    conversation.append({ role: "user", content: tool_results })
```

### Using the Tools (What You Can Ask It To Do)

Although you *can* talk to Claude like a normal chat, the interesting part is when it uses tools to work with your files. You don’t need to know the exact tool names; just describe what you want to do in natural language.

Examples of useful prompts once the agent is running:

- **Inspect the project**
  - “List all files in the current directory and any subdirectories that look interesting to edit.”
  - “Show me the contents of `main.go`.”
- **Ask for code changes**
  - “Create a new file `examples/fizzbuzz.js` that prints FizzBuzz from 1 to 100.”
  - “Update the agent so the help text mentions the three tools: `read_file`, `list_files`, and `edit_file`.”
  - “Refactor the agent so the tool definitions are moved into a separate file and explain what you changed.”

Under the hood, Claude will:

- Call `list_files` to discover files and directories.
- Call `read_file` to inspect existing code.
- Call `edit_file` one or more times to patch or create files.

The agent prints every tool call it executes in the terminal, so you can see exactly what’s happening.

### Notes and Safety

- **Edits are real**: `edit_file` will modify or create files in your working directory. Use version control (e.g., `git`) if you want easy rollback.
- **Project root**: Paths are interpreted relative to where you run the process. Stay consistent and run from the project root.
- **API usage**: Each turn is a real API call to Anthropic; your usage will count against your Anthropic quota/billing.

### Where to Look in the Code

- **Go**
  - `main.go`: `Agent` struct, `Run`, `runInference`, `executeTool`, and tool definitions (`read_file`, `list_files`, `edit_file`), plus JSON schema generation using `github.com/invopop/jsonschema`.
- **Python**
  - `python_agent.py`: `Agent` class, `ToolDefinition` dataclass, and Python implementations of the same three tools.
- **JavaScript / Node**
  - `js-agent/index.mjs`: `Agent` class, `ToolDefinition` helper, and Node implementations of the tools using `@anthropic-ai/sdk`.
- **Java**
  - `java-agent/src/main/java/com/example/agent/JavaAgent.java`: `JavaAgent` class, `ToolDefinition` record, and tool implementations using OkHttp + Jackson against the Claude HTTP API.

All implementations are commented at the level of intent and architecture to show how the loop and tools turn a plain LLM call into a simple but powerful code-editing agent.

---

## Language-Specific Setup and Usage

Below are per-language instructions as collapsible sections. Pick the language you care about, or mix and match.

<details>
<summary><strong>Go</strong></summary>

- **Prerequisites**:
  - **Go** 1.22+.
  - An **Anthropic API key** in `ANTHROPIC_API_KEY`.

- **One-time setup** (from the project root, e.g. `c:\Users\shrey\Desktop\codesbyshrey\Cursor`):

  ```powershell
  cd c:\Users\shrey\Desktop\codesbyshrey\Cursor
  [System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "your-key-here", "User")
  go mod tidy
  ```

- **Run the Go agent**:

  ```powershell
  cd c:\Users\shrey\Desktop\codesbyshrey\Cursor
  go run main.go
  ```

  You should see:

  ```text
  Chat with Claude (use 'ctrl-c' to quit)
  You:
  ```

  Type your messages after `You:` and press Enter to chat and let Claude edit files via tools.

</details>

<details>
<summary><strong>Python</strong></summary>

- **Prerequisites**:
  - **Python** 3.9+.
  - An **Anthropic API key** in `ANTHROPIC_API_KEY`.

- **Install dependencies** (from the project root):

  ```powershell
  cd c:\Users\shrey\Desktop\codesbyshrey\Cursor
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  ```

- **Set your API key** (for the current PowerShell session):

  ```powershell
  $env:ANTHROPIC_API_KEY = "your-key-here"
  ```

- **Run the Python agent**:

  ```powershell
  cd c:\Users\shrey\Desktop\codesbyshrey\Cursor
  python python_agent.py
  ```

  The behavior matches the Go agent: terminal chat loop, and Claude uses `read_file`, `list_files`, and `edit_file` implemented in Python.

</details>

<details>
<summary><strong>JavaScript / Node</strong></summary>

- **Prerequisites**:
  - **Node.js** 18+.
  - An **Anthropic API key** in `ANTHROPIC_API_KEY`.

- **Install dependencies**:

  ```powershell
  cd c:\Users\shrey\Desktop\codesbyshrey\Cursor\js-agent
  npm install
  ```

- **Set your API key**:

  ```powershell
  $env:ANTHROPIC_API_KEY = "your-key-here"
  ```

- **Run the Node agent**:

  ```powershell
  cd c:\Users\shrey\Desktop\codesbyshrey\Cursor\js-agent
  node index.mjs
  ```

  You’ll get the same interactive chat loop, with tools wired through `@anthropic-ai/sdk`.

</details>

<details>
<summary><strong>Java</strong></summary>

- **Prerequisites**:
  - **Java** 17+ (JDK).
  - **Maven**.
  - An **Anthropic API key** in `ANTHROPIC_API_KEY`.

- **Build the Java agent**:

  ```powershell
  cd c:\Users\shrey\Desktop\codesbyshrey\Cursor\java-agent
  $env:ANTHROPIC_API_KEY = "your-key-here"
  mvn package
  ```

- **Run the fat JAR**:

  ```powershell
  cd c:\Users\shrey\Desktop\codesbyshrey\Cursor\java-agent
  java -jar target/java-agent-1.0.0-jar-with-dependencies.jar
  ```

  This version talks directly to the Claude HTTP API via OkHttp but uses the same conversation + tools pattern.

</details>
