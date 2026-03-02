# 第10章：从零构建一个 AI Agent

> *"One loop & Bash is all you need" -- 一个工具 + 一个循环 = 一个智能体。*

在本章中，我们将从零开始构建一个完整的 AI Agent 系统。这是一个循序渐进的实战教程，共分为 12 个步骤，每个步骤在前一步的基础上增加新的能力。最终，你将拥有一个支持多智能体协作、任务管理、自治执行的完整系统。

## 准备工作

### 环境要求

- Python 3.10+
- Anthropic API Key
- Git

### 项目结构

```
learn-agent/
├── agents/           # 各步骤的实现
│   ├── s01_agent_loop.py
│   ├── s02_tool_use.py
│   └── ...
├── skills/           # 技能定义
│   └── git/
│       └── SKILL.md
├── .tasks/           # 任务存储（运行时创建）
├── .worktrees/       # worktree 存储（运行时创建）
├── .env              # API key
└── requirements.txt
```

### 基础依赖

```txt
# requirements.txt
anthropic>=0.30.0
```

## 第一步：Agent 循环 (s01)

### 核心概念

智能体的核心是一个**循环**：
1. 用户输入 → LLM 推理
2. LLM 决定调用工具 → 执行工具
3. 工具结果 → LLM 继续推理
4. 直到 LLM 不再调用工具，返回最终结果

### 最小实现

```python
# agents/s01_agent_loop.py
"""
s01: The Agent Loop - 智能体循环

One loop & Bash is all you need.
一个工具 + 一个循环 = 一个智能体。
"""

import os
from anthropic import Anthropic

# 配置
API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = "claude-3-5-sonnet-20241022"
WORKDIR = os.getcwd()

# 系统提示
SYSTEM = f"""You are a coding agent at {WORKDIR}.
You have access to bash commands to help users with programming tasks."""

# 工具定义 - 只有一个 bash 工具
TOOLS = [
    {
        "name": "bash",
        "description": "Run a bash command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "The bash command to run"
                }
            },
            "required": ["command"]
        }
    }
]

client = Anthropic(api_key=API_KEY)


def run_bash(command: str) -> str:
    """执行 bash 命令并返回输出"""
    import subprocess
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60,
            cwd=WORKDIR
        )
        output = result.stdout
        if result.stderr:
            output += f"\n[stderr]: {result.stderr}"
        if result.returncode != 0:
            output += f"\n[exit code: {result.returncode}]"
        return output[:50000]  # 限制返回大小
    except subprocess.TimeoutExpired:
        return "Error: Command timed out after 60s"
    except Exception as e:
        return f"Error: {e}"


def agent_loop(query: str):
    """
    核心智能体循环

    流程:
    1. 用户输入 → messages
    2. LLM 推理 → 可能调用工具
    3. 执行工具 → 结果加入 messages
    4. 循环直到 stop_reason != "tool_use"
    """
    messages = [{"role": "user", "content": query}]

    while True:
        # 调用 LLM
        response = client.messages.create(
            model=MODEL,
            system=SYSTEM,
            messages=messages,
            tools=TOOLS,
            max_tokens=8000
        )

        # 记录助手回复
        messages.append({"role": "assistant", "content": response.content})

        # 检查是否需要调用工具
        if response.stop_reason != "tool_use":
            # 完成！返回最终答案
            for block in response.content:
                if block.type == "text":
                    print(block.text)
            return

        # 执行工具调用
        results = []
        for block in response.content:
            if block.type == "tool_use":
                if block.name == "bash":
                    output = run_bash(block.input["command"])
                    results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": output
                    })

        # 将结果加入对话
        messages.append({"role": "user", "content": results})


def main():
    print("=" * 50)
    print("s01: The Agent Loop - 智能体循环")
    print("=" * 50)
    print(f"Working directory: {WORKDIR}")
    print()
    print("Try these prompts:")
    print('  - Create a file called hello.py that prints "Hello, World!"')
    print('  - List all Python files in this directory')
    print('  - What is the current git branch?')
    print()

    while True:
        try:
            query = input("You: ").strip()
            if not query:
                continue
            if query.lower() in ("exit", "quit"):
                break

            print("\nAssistant: ")
            agent_loop(query)
            print()

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break


if __name__ == "__main__":
    main()
```

### 运行测试

```bash
export ANTHROPIC_API_KEY="your-api-key"
python agents/s01_agent_loop.py
```

**测试指令：**
1. `Create a file called hello.py that prints "Hello, World!"`
2. `List all Python files in this directory`
3. `What is the current git branch?`

## 第二步：工具使用 (s02)

### 核心概念

增加工具时，**循环本身不需要改变**。只需要：
1. 定义新工具的 schema
2. 实现对应的 handler 函数
3. 注册到 dispatch map

### 代码演进

```python
# agents/s02_tool_use.py
"""
s02: Tool Use - 工具使用

加一个工具，只加一个 handler。循环不用动。
"""

import os
from pathlib import Path
from anthropic import Anthropic

# 配置
API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = "claude-3-5-sonnet-20241022"
WORKDIR = Path(os.getcwd())

# 系统提示
SYSTEM = f"""You are a coding agent at {WORKDIR}.
You have access to tools to read, write, and edit files, as well as run bash commands."""


# ============================================================================
# 工具定义
# ============================================================================

TOOLS = [
    {
        "name": "bash",
        "description": "Run a bash command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "The bash command to run"}
            },
            "required": ["command"]
        }
    },
    {
        "name": "read_file",
        "description": "Read a file's contents",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path relative to working directory"},
                "limit": {"type": "integer", "description": "Maximum number of lines to read (optional)"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path relative to working directory"},
                "content": {"type": "string", "description": "Content to write"}
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "edit_file",
        "description": "Edit a file by replacing text",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"},
                "old_text": {"type": "string", "description": "Text to replace"},
                "new_text": {"type": "string", "description": "Replacement text"}
            },
            "required": ["path", "old_text", "new_text"]
        }
    }
]


# ============================================================================
# 工具处理函数
# ============================================================================

def safe_path(p: str) -> Path:
    """确保路径不会逃逸工作目录"""
    path = (WORKDIR / p).resolve()
    if not path.is_relative_to(WORKDIR):
        raise ValueError(f"Path escapes workspace: {p}")
    return path


def run_bash(command: str) -> str:
    """执行 bash 命令"""
    import subprocess
    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True,
            timeout=60, cwd=WORKDIR
        )
        output = result.stdout
        if result.stderr:
            output += f"\n[stderr]: {result.stderr}"
        return output[:50000]
    except Exception as e:
        return f"Error: {e}"


def run_read(path: str, limit: int = None) -> str:
    """读取文件内容"""
    try:
        text = safe_path(path).read_text()
        lines = text.splitlines()
        if limit and limit < len(lines):
            lines = lines[:limit]
        return "\n".join(lines)[:50000]
    except Exception as e:
        return f"Error reading file: {e}"


def run_write(path: str, content: str) -> str:
    """写入文件"""
    try:
        p = safe_path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)
        return f"File written: {path}"
    except Exception as e:
        return f"Error writing file: {e}"


def run_edit(path: str, old_text: str, new_text: str) -> str:
    """编辑文件"""
    try:
        p = safe_path(path)
        content = p.read_text()
        if old_text not in content:
            return f"Error: old_text not found in file"
        content = content.replace(old_text, new_text, 1)
        p.write_text(content)
        return f"File edited: {path}"
    except Exception as e:
        return f"Error editing file: {e}"


# ============================================================================
# Dispatch Map - 核心设计：加工具只需要加 handler
# ============================================================================

TOOL_HANDLERS = {
    "bash": lambda **kw: run_bash(kw["command"]),
    "read_file": lambda **kw: run_read(kw["path"], kw.get("limit")),
    "write_file": lambda **kw: run_write(kw["path"], kw["content"]),
    "edit_file": lambda **kw: run_edit(kw["path"], kw["old_text"], kw["new_text"]),
}

client = Anthropic(api_key=API_KEY)


def agent_loop(query: str):
    """智能体循环 - 加工具不需要改这里"""
    messages = [{"role": "user", "content": query}]

    while True:
        response = client.messages.create(
            model=MODEL, system=SYSTEM, messages=messages,
            tools=TOOLS, max_tokens=8000
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            for block in response.content:
                if block.type == "text":
                    print(block.text)
            return

        # 使用 dispatch map 执行工具
        results = []
        for block in response.content:
            if block.type == "tool_use":
                handler = TOOL_HANDLERS.get(block.name)
                if handler:
                    output = handler(**block.input)
                else:
                    output = f"Unknown tool: {block.name}"
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output
                })
        messages.append({"role": "user", "content": results})


def main():
    print("=" * 50)
    print("s02: Tool Use - 工具使用")
    print("=" * 50)
    print(f"Working directory: {WORKDIR}")
    print()
    print("Try these prompts:")
    print('  - Read the file requirements.txt')
    print('  - Create a file called greet.py with a greet(name) function')
    print('  - Edit greet.py to add a docstring to the function')
    print()

    while True:
        try:
            query = input("You: ").strip()
            if not query:
                continue
            if query.lower() in ("exit", "quit"):
                break

            print("\nAssistant: ")
            agent_loop(query)
            print()

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break


if __name__ == "__main__":
    main()
```

### 关键设计原则

| 设计 | 说明 |
|------|------|
| Dispatch Map | `TOOL_HANDLERS` 字典将工具名映射到处理函数 |
| 路径沙箱 | `safe_path()` 确保所有文件操作在工作目录内 |
| 零循环改动 | 新增工具只需添加 handler，无需修改循环逻辑 |

---

由于篇幅限制，下面概述后续步骤的核心思想。完整代码可参考项目仓库。

## 第三步：待办写入 (s03)

### 核心概念

> *"没有计划的 agent 走哪算哪"* -- 先列步骤再动手，完成率翻倍。

在多步任务中，模型会丢失进度。TodoWrite 工具让智能体显式维护任务清单。

### 关键实现

```python
class TodoManager:
    """待办事项管理器 - 同一时间只允许一个 in_progress"""

    def __init__(self):
        self.items = []

    def update(self, items: list) -> str:
        """更新待办列表，验证状态"""
        validated = []
        in_progress_count = 0

        for item in items:
            status = item.get("status", "pending")
            if status == "in_progress":
                in_progress_count += 1
            validated.append({
                "id": item["id"],
                "text": item["text"],
                "status": status
            })

        if in_progress_count > 1:
            raise ValueError("Only one task can be in_progress")

        self.items = validated
        return self.render()

    def render(self) -> str:
        """渲染待办列表为字符串"""
        lines = ["Todo List:"]
        for item in self.items:
            symbol = {"pending": "[ ]", "in_progress": "[>]", "completed": "[x]"}.get(item["status"], "[ ]")
            lines.append(f"  {symbol} {item['id']}: {item['text']}")
        return "\n".join(lines)


# 全局待办管理器
TODO = TodoManager()

# 添加到 dispatch map
TOOL_HANDLERS["todo"] = lambda **kw: TODO.update(kw["items"])
```

### Nag 提醒机制

```python
# 如果连续 3 轮没有更新 todo，注入提醒
ROUNDS_SINCE_TODO = 0

def agent_loop(query: str):
    global ROUNDS_SINCE_TODO
    messages = [{"role": "user", "content": query}]

    while True:
        # Nag 提醒
        if ROUNDS_SINCE_TODO >= 3 and messages:
            last = messages[-1]
            if last["role"] == "user":
                last["content"].insert(0, {
                    "type": "text",
                    "text": "<reminder>Update your todos.</reminder>"
                })

        response = client.messages.create(...)

        # 检查是否调用了 todo
        todo_called = any(
            block.type == "tool_use" and block.name == "todo"
            for block in response.content
        )
        ROUNDS_SINCE_TODO = 0 if todo_called else ROUNDS_SINCE_TODO + 1

        # ... 其余逻辑
```

## 第四步：子智能体 (s04)

### 核心概念

> *"大任务拆小，每个小任务干净的上下文"* -- 子智能体用独立 messages[]，不污染主对话。

### 架构设计

```
Parent agent                     Subagent
+------------------+             +------------------+
| messages=[...]   |             | messages=[]      | <-- fresh
|                  |  dispatch   |                  |
| tool: task       | ----------> | while tool_use:  |
|   prompt="..."   |             |   call tools     |
|                  |  summary    |   append results |
|   result = "..." | <---------- | return last text |
+------------------+             +------------------+
```

### 实现代码

```python
# 父智能体工具定义
PARENT_TOOLS = [
    # ... 基础工具 ...
    {
        "name": "task",
        "description": "Spawn a subagent with fresh context to handle a subtask",
        "input_schema": {
            "type": "object",
            "properties": {
                "prompt": {"type": "string", "description": "The subtask for the subagent"}
            },
            "required": ["prompt"]
        }
    }
]

# 子智能体工具（没有 task 工具，禁止递归）
CHILD_TOOLS = [t for t in PARENT_TOOLS if t["name"] != "task"]


def run_subagent(prompt: str) -> str:
    """
    运行子智能体，使用干净的上下文

    子智能体运行完整的 loop，但只返回最终文本给父智能体
    """
    sub_messages = [{"role": "user", "content": prompt}]

    for _ in range(30):  # 安全限制
        response = client.messages.create(
            model=MODEL,
            system=SUBAGENT_SYSTEM,
            messages=sub_messages,
            tools=CHILD_TOOLS,
            max_tokens=8000
        )

        sub_messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            break

        # 执行工具调用
        results = []
        for block in response.content:
            if block.type == "tool_use":
                handler = TOOL_HANDLERS.get(block.name)
                output = handler(**block.input) if handler else f"Unknown tool: {block.name}"
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(output)[:50000]
                })
        sub_messages.append({"role": "user", "content": results})

    # 返回最终文本
    final_text = "".join(
        b.text for b in response.content if hasattr(b, "text")
    ) or "(no summary)"
    return final_text


# 更新父智能体的 dispatch map
TOOL_HANDLERS["task"] = lambda **kw: run_subagent(kw["prompt"])
```

## 第五步：技能加载 (s05)

### 核心概念

> *"用到什么知识，临时加载什么知识"* -- 通过 tool_result 注入，不塞 system prompt。

### 两层架构

```
System prompt (Layer 1 -- always present):
+--------------------------------------+
| You are a coding agent.              |
| Skills available:                    |
|   - git: Git workflow helpers        |  ~100 tokens/skill
|   - test: Testing best practices     |
+--------------------------------------+

When model calls load_skill("git"):
+--------------------------------------+
| tool_result (Layer 2 -- on demand):  |
| <skill name="git">                   |
|   Full git workflow instructions...  |  ~2000 tokens
|   Step 1: ...                        |
| </skill>                             |
+--------------------------------------+
```

### 实现代码

```python
class SkillLoader:
    """技能加载器 - 按需加载知识"""

    def __init__(self, skills_dir: Path):
        self.skills = {}
        for f in sorted(skills_dir.rglob("SKILL.md")):
            text = f.read_text()
            meta, body = self._parse_frontmatter(text)
            name = meta.get("name", f.parent.name)
            self.skills[name] = {"meta": meta, "body": body}

    def _parse_frontmatter(self, text: str) -> tuple:
        """解析 YAML frontmatter"""
        if text.startswith("---"):
            parts = text.split("---", 2)
            if len(parts) >= 3:
                import yaml
                meta = yaml.safe_load(parts[1])
                body = parts[2].strip()
                return meta or {}, body
        return {}, text

    def get_descriptions(self) -> str:
        """获取技能描述列表（用于系统提示）"""
        lines = []
        for name, skill in self.skills.items():
            desc = skill["meta"].get("description", "")
            lines.append(f"  - {name}: {desc}")
        return "\n".join(lines)

    def get_content(self, name: str) -> str:
        """获取技能完整内容（通过 tool_result 注入）"""
        skill = self.skills.get(name)
        if not skill:
            return f"Error: Unknown skill '{name}'."
        return f"<skill name=\"{name}\">\n{skill['body']}\n</skill>"


# 初始化
SKILL_LOADER = SkillLoader(Path("skills"))

# 更新系统提示
SYSTEM = f"""You are a coding agent at {WORKDIR}.
Skills available:
{SKILL_LOADER.get_descriptions()}

Call load_skill(name) to load detailed instructions for a skill."""

# 添加工具
TOOLS.append({
    "name": "load_skill",
    "description": "Load detailed skill instructions",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Skill name"}
        },
        "required": ["name"]
    }
})

# 添加 handler
TOOL_HANDLERS["load_skill"] = lambda **kw: SKILL_LOADER.get_content(kw["name"])
```

## 第六步：上下文压缩 (s06)

### 核心概念

> *"上下文总会满，要有办法腾地方"* -- 三层压缩策略，换来无限会话。

### 三层压缩策略

```
Every turn:
+------------------+
| Tool call result |
+------------------+
        |
        v
[Layer 1: micro_compact]        (silent, every turn)
  Replace tool_result > 3 turns old
  with "[Previous: used {tool_name}]"
        |
        v
[Check: tokens > 50000?]
   |               |
   no              yes
   |               |
   v               v
continue    [Layer 2: auto_compact]
              Save transcript to .transcripts/
              LLM summarizes conversation.
              Replace all messages with [summary].
                    |
                    v
            [Layer 3: compact tool]
              Model calls compact explicitly.
              Same summarization as auto_compact.
```

### 实现代码

```python
import json
import time
from pathlib import Path

# 配置
TRANSCRIPT_DIR = Path(".transcripts")
TRANSCRIPT_DIR.mkdir(exist_ok=True)
KEEP_RECENT = 3  # 保留最近3个 tool result
TOKEN_THRESHOLD = 50000


def estimate_tokens(messages: list) -> int:
    """粗略估计 token 数"""
    total = 0
    for msg in messages:
        if isinstance(msg.get("content"), str):
            total += len(msg["content"]) // 4
        elif isinstance(msg.get("content"), list):
            for item in msg["content"]:
                if isinstance(item, dict) and "content" in item:
                    total += len(str(item["content"])) // 4
    return total


def micro_compact(messages: list) -> list:
    """
    第一层压缩：将旧的 tool result 替换为占位符
    """
    # 收集所有 tool_result
    tool_results = []
    for i, msg in enumerate(messages):
        if msg["role"] == "user" and isinstance(msg.get("content"), list):
            for j, part in enumerate(msg["content"]):
                if isinstance(part, dict) and part.get("type") == "tool_result":
                    tool_results.append((i, j, part))

    # 只保留最近的，其他的压缩
    if len(tool_results) <= KEEP_RECENT:
        return messages

    for _, _, part in tool_results[:-KEEP_RECENT]:
        if len(part.get("content", "")) > 100:
            # 提取工具名（从占位符中）
            part["content"] = "[Previous: tool result omitted]"

    return messages


def auto_compact(messages: list) -> list:
    """
    第二层压缩：自动摘要对话历史
    """
    # 1. 保存完整记录
    transcript_path = TRANSCRIPT_DIR / f"transcript_{int(time.time())}.jsonl"
    with open(transcript_path, "w") as f:
        for msg in messages:
            f.write(json.dumps(msg, default=str) + "\n")

    # 2. 让 LLM 摘要
    summary_response = client.messages.create(
        model=MODEL,
        messages=[{
            "role": "user",
            "content": "Summarize this conversation for continuity. "
                       "Preserve key decisions and current state.\n\n"
                       + json.dumps(messages, default=str)[:80000]
        }],
        max_tokens=2000
    )

    summary = summary_response.content[0].text

    # 3. 替换为压缩后的消息
    return [
        {"role": "user", "content": f"[Context compressed - previous work summarized]\n\n{summary}"},
        {"role": "assistant", "content": "Understood. Continuing with summarized context."}
    ]


def agent_loop(query: str):
    """包含压缩的完整循环"""
    messages = [{"role": "user", "content": query}]

    while True:
        # 第一层压缩
        micro_compact(messages)

        # 第二层压缩（token 超限）
        if estimate_tokens(messages) > TOKEN_THRESHOLD:
            messages = auto_compact(messages)

        response = client.messages.create(
            model=MODEL, system=SYSTEM, messages=messages,
            tools=TOOLS, max_tokens=8000
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            for block in response.content:
                if block.type == "text":
                    print(block.text)
            return

        # 执行工具...
```

