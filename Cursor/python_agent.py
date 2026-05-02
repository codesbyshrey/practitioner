"""
Terminal-based code-editing agent implemented in Python.

This mirrors the Go example:
- keep a running conversation array of messages
- describe a set of tools via JSON schemas
- let Claude decide when to call tools, execute them locally, and feed back results
"""

import json
import os
import sys
from dataclasses import dataclass
from typing import Any, Callable, Dict, List

from anthropic import Anthropic


@dataclass
class ToolDefinition:
    """
    Description of a single tool exposed to Claude.

    The important fields are:
    - name / description: used in the tools section of the API call
    - input_schema: JSON Schema that tells Claude how to structure its input
    - func: Python function that actually performs the side-effect
    """

    name: str
    description: str
    input_schema: Dict[str, Any]
    func: Callable[[Dict[str, Any]], str]


class Agent:
    """
    Simple code-editing agent:
    - maintains a conversation with Claude
    - exposes filesystem tools (read/list/edit files)
    - executes tool calls and feeds results back to Claude
    """

    def __init__(self, client: Anthropic, tools: List[ToolDefinition]) -> None:
        self.client = client
        self.tools = tools

    def run(self) -> None:
        """
        Main chat loop running in the terminal.

        The structure of each message in `conversation` matches the Claude API:
        - role: "user" or "assistant"
        - content: list of blocks, which can be plain text, tool_use, or tool_result
        """
        conversation: List[Dict[str, Any]] = []

        print("Chat with Claude (use Ctrl+C to quit)")
        read_user_input = True

        while True:
            if read_user_input:
                sys.stdout.write("\033[94mYou\033[0m: ")
                sys.stdout.flush()
                line = sys.stdin.readline()
                if not line:
                    break
                user_input = line.rstrip("\n")

                conversation.append(
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": user_input}],
                    }
                )

            message = self._run_inference(conversation)
            conversation.append(
                {
                    "role": "assistant",
                    "content": message.content,
                }
            )

            tool_results: List[Dict[str, Any]] = []
            for block in message.content:
                block_type = block.get("type")
                if block_type == "text":
                    print(f"\033[93mClaude\033[0m: {block['text']}")
                elif block_type == "tool_use":
                    result_block = self._execute_tool(block)
                    tool_results.append(result_block)

            if not tool_results:
                read_user_input = True
                continue

            read_user_input = False
            conversation.append(
                {
                    "role": "user",
                    "content": tool_results,
                }
            )

    def _run_inference(self, conversation: List[Dict[str, Any]]):
        """Send the conversation and tool definitions to Claude."""
        tools_payload = [
            {
                "name": t.name,
                "description": t.description,
                "input_schema": t.input_schema,
            }
            for t in self.tools
        ]

        return self.client.messages.create(
            model="claude-3-7-sonnet-latest",
            max_tokens=1024,
            tools=tools_payload,
            messages=conversation,
        )

    def _execute_tool(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Look up and execute a requested tool, returning a tool_result block."""
        name = block["name"]
        tool_input = block["input"]
        tool_use_id = block["id"]

        tool = next((t for t in self.tools if t.name == name), None)
        if tool is None:
            return {
                "type": "tool_result",
                "tool_use_id": tool_use_id,
                "content": "tool not found",
                "is_error": True,
            }

        print(f"\033[92mtool\033[0m: {name}({json.dumps(tool_input)})")

        try:
            result = tool.func(tool_input)
            return {
                "type": "tool_result",
                "tool_use_id": tool_use_id,
                "content": result,
                "is_error": False,
            }
        except Exception as exc:
            return {
                "type": "tool_result",
                "tool_use_id": tool_use_id,
                "content": str(exc),
                "is_error": True,
            }


# ---------- Tools ----------


def read_file_tool(input_obj: Dict[str, Any]) -> str:
    """Implementation of the read_file tool."""
    path = input_obj["path"]
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


READ_FILE_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "path": {
            "type": "string",
            "description": "The relative path of a file in the working directory.",
        }
    },
    "required": ["path"],
    "additionalProperties": False,
}


def list_files_tool(input_obj: Dict[str, Any]) -> str:
    """Implementation of the list_files tool (recursive)."""
    base_dir = input_obj.get("path") or "."

    files: List[str] = []
    for root, dirs, filenames in os.walk(base_dir):
        rel_root = os.path.relpath(root, base_dir)

        # Add directory entries (with trailing slash) except the root itself
        if rel_root != ".":
            for d in dirs:
                files.append(os.path.join(rel_root, d) + "/")
        else:
            for d in dirs:
                files.append(d + "/")

        # Add file entries
        for filename in filenames:
            if rel_root == ".":
                files.append(filename)
            else:
                files.append(os.path.join(rel_root, filename))

    return json.dumps(files)


LIST_FILES_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "path": {
            "type": "string",
            "description": "Optional relative path to list files from. Defaults to current directory.",
        }
    },
    "required": [],
    "additionalProperties": False,
}


def edit_file_tool(input_obj: Dict[str, Any]) -> str:
    """
    Implementation of the edit_file tool.

    - If the file exists, replace all occurrences of old_str with new_str.
    - If the file doesn't exist and old_str is empty, create a new file (and parents).
    """
    path = input_obj["path"]
    old_str = input_obj.get("old_str", "")
    new_str = input_obj.get("new_str", "")

    if not path or old_str == new_str:
        raise ValueError("invalid input parameters")

    if not os.path.exists(path):
        if old_str != "":
            raise FileNotFoundError(path)
        return _create_new_file(path, new_str)

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if old_str:
        new_content = content.replace(old_str, new_str)
        if new_content == content:
            raise ValueError("old_str not found in file")
    else:
        new_content = new_str

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    return "OK"


EDIT_FILE_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "path": {
            "type": "string",
            "description": "The path to the file.",
        },
        "old_str": {
            "type": "string",
            "description": "Text to search for - must match exactly and must only have one match exactly.",
        },
        "new_str": {
            "type": "string",
            "description": "Text to replace old_str with.",
        },
    },
    "required": ["path", "old_str", "new_str"],
    "additionalProperties": False,
}


def _create_new_file(file_path: str, content: str) -> str:
    """Create parent directories if needed and write a new file."""
    directory = os.path.dirname(file_path)
    if directory and directory != ".":
        os.makedirs(directory, exist_ok=True)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    return f"Successfully created file {file_path}"


def main() -> None:
    """Entry point: wire up client, tools, and run the agent."""
    client = Anthropic()

    tools = [
        ToolDefinition(
            name="read_file",
            description="Read the contents of a given relative file path. Use this when you want to see what's inside a file. Do not use this with directory names.",
            input_schema=READ_FILE_SCHEMA,
            func=read_file_tool,
        ),
        ToolDefinition(
            name="list_files",
            description="List files and directories at a given path. If no path is provided, lists files in the current directory.",
            input_schema=LIST_FILES_SCHEMA,
            func=list_files_tool,
        ),
        ToolDefinition(
            name="edit_file",
            description=(
                "Make edits to a text file. "
                "Replaces 'old_str' with 'new_str' in the given file. "
                "If the file doesn't exist and old_str is empty, it will be created."
            ),
            input_schema=EDIT_FILE_SCHEMA,
            func=edit_file_tool,
        ),
    ]

    agent = Agent(client=client, tools=tools)
    agent.run()


if __name__ == "__main__":
    main()

