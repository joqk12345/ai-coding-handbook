# 第12章：多智能体系统与自治执行

本章是实战部分的最终章，我们将构建一个完整的多智能体协作系统，包括后台任务执行、智能体团队、自治执行和 Worktree 隔离等高级功能。

## 第八步：后台任务 (s08)

### 核心概念

> *"慢操作丢后台，agent 继续想下一步"* -- 后台线程跑命令，完成后注入通知。

### 架构设计

```
Main thread                Background thread
+-----------------+        +-----------------+
| agent loop      |        | subprocess runs |
| ...             |        | ...             |
| [LLM call] <---+------- | enqueue(result) |
|  ^drain queue   |        +-----------------+
+-----------------+

Timeline:
Agent --[spawn A]--[spawn B]--[other work]----
             |          |
             v          v
          [A runs]   [B runs]      (parallel)
             |          |
             +-- results injected before next LLM call --+
```

### 实现代码

```python
import threading
import uuid
import queue
from typing import Dict, List


class BackgroundManager:
    """后台任务管理器"""

    def __init__(self):
        self.tasks: Dict[str, dict] = {}
        self._notification_queue: List[dict] = []
        self._lock = threading.Lock()

    def run(self, command: str) -> str:
        """启动后台任务，立即返回"""
        task_id = str(uuid.uuid4())[:8]

        with self._lock:
            self.tasks[task_id] = {
                "status": "running",
                "command": command
            }

        # 启动守护线程
        thread = threading.Thread(
            target=self._execute,
            args=(task_id, command),
            daemon=True
        )
        thread.start()

        return f"Background task {task_id} started"

    def _execute(self, task_id: str, command: str):
        """在后台执行命令"""
        import subprocess
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300,  # 5分钟超时
                cwd=WORKDIR
            )
            output = (result.stdout + result.stderr).strip()[:50000]
        except subprocess.TimeoutExpired:
            output = "Error: Timeout (300s)"
        except Exception as e:
            output = f"Error: {e}"

        # 将结果放入通知队列
        with self._lock:
            self.tasks[task_id]["status"] = "completed"
            self.tasks[task_id]["output"] = output[:500]  # 摘要
            self._notification_queue.append({
                "task_id": task_id,
                "result": output[:500]
            })

    def drain_notifications(self) -> List[dict]:
        """获取并清空通知队列"""
        with self._lock:
            notifs = self._notification_queue.copy()
            self._notification_queue.clear()
            return notifs

    def check_status(self, task_id: str = None) -> str:
        """检查任务状态"""
        with self._lock:
            if task_id:
                task = self.tasks.get(task_id)
                if not task:
                    return f"Task {task_id} not found"
                return json.dumps(task, indent=2)
            else:
                return json.dumps(self.tasks, indent=2)


# 全局后台管理器
BG = BackgroundManager()

# 添加工具定义
TOOLS.extend([
    {
        "name": "background_run",
        "description": "Run a command in the background",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "Command to run"}
            },
            "required": ["command"]
        }
    },
    {
        "name": "background_check",
        "description": "Check background task status",
        "input_schema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "string", "description": "Optional task ID"}
            }
        }
    }
])

# 添加 handlers
TOOL_HANDLERS["background_run"] = lambda **kw: BG.run(kw["command"])
TOOL_HANDLERS["background_check"] = lambda **kw: BG.check_status(kw.get("task_id"))


def agent_loop(query: str):
    """包含后台通知处理的循环"""
    messages = [{"role": "user", "content": query}]

    while True:
        # 在每次 LLM 调用前排空后台通知
        notifs = BG.drain_notifications()
        if notifs:
            notif_text = "\n".join(
                f"[bg:{n['task_id']}] {n['result']}" for n in notifs
            )
            messages.append({
                "role": "user",
                "content": f"<background-results>\n{notif_text}\n</background-results>"
            })
            messages.append({
                "role": "assistant",
                "content": "Noted background results."
            })

        # 正常的 LLM 调用...
        response = client.messages.create(
            model=MODEL, system=SYSTEM, messages=messages,
            tools=TOOLS, max_tokens=8000
        )
        # ... 其余逻辑
```

## 第九步：智能体团队 (s09)

### 核心概念

> *"任务太大一个人干不完，要能分给队友"* -- 持久化队友 + JSONL 邮箱。

### 架构设计

```
Teammate lifecycle:
  spawn -> WORKING -> IDLE -> WORKING -> ... -> SHUTDOWN

Communication:
  .team/
    config.json           <- team roster + statuses
    inbox/
      alice.jsonl         <- append-only, drain-on-read
      bob.jsonl
      lead.jsonl

              +--------+    send("alice","bob","...")    +--------+
              | alice  | -----------------------------> |  bob   |
              | loop   |    bob.jsonl << {json_line}    |  loop  |
              +--------+                                +--------+
                   ^                                         |
                   |        BUS.read_inbox("alice")          |
                   +---- alice.jsonl -> read + drain ---------+
```

### 实现代码

```python
import threading
import time
from pathlib import Path
from typing import Dict, List, Optional

TEAM_DIR = Path(".team")
TEAM_DIR.mkdir(exist_ok=True)
INBOX_DIR = TEAM_DIR / "inbox"
INBOX_DIR.mkdir(exist_ok=True)


class MessageBus:
    """消息总线 - JSONL 邮箱"""

    def __init__(self, inbox_dir: Path = INBOX_DIR):
        self.dir = inbox_dir
        self.dir.mkdir(exist_ok=True)

    def send(self, sender: str, to: str, content: str,
             msg_type: str = "message", extra: dict = None):
        """发送消息到指定收件箱"""
        msg = {
            "type": msg_type,
            "from": sender,
            "content": content,
            "timestamp": time.time()
        }
        if extra:
            msg.update(extra)

        path = self.dir / f"{to}.jsonl"
        with open(path, "a") as f:
            f.write(json.dumps(msg) + "\n")

        return f"Message sent to {to}"

    def read_inbox(self, name: str) -> str:
        """读取并清空收件箱"""
        path = self.dir / f"{name}.jsonl"
        if not path.exists():
            return "[]"

        lines = path.read_text().strip().splitlines()
        msgs = [json.loads(l) for l in lines if l]

        # 清空
        path.write_text("")

        return json.dumps(msgs, indent=2)


class TeammateManager:
    """队友管理器"""

    def __init__(self, team_dir: Path = TEAM_DIR):
        self.dir = team_dir
        self.dir.mkdir(exist_ok=True)
        self.config_path = self.dir / "config.json"
        self.config = self._load_config()
        self.threads: Dict[str, threading.Thread] = {}

    def _load_config(self) -> dict:
        """加载团队配置"""
        if self.config_path.exists():
            return json.loads(self.config_path.read_text())
        return {"members": []}

    def _save_config(self):
        """保存团队配置"""
        self.config_path.write_text(json.dumps(self.config, indent=2))

    def _find_member(self, name: str) -> Optional[dict]:
        """查找成员"""
        for m in self.config["members"]:
            if m["name"] == name:
                return m
        return None

    def spawn(self, name: str, role: str, prompt: str) -> str:
        """
        生成队友并启动独立线程

        Args:
            name: 队友名称
            role: 角色描述 (如 "coder", "tester", "reviewer")
            prompt: 初始任务提示
        """
        # 检查是否已存在
        if self._find_member(name):
            return f"Error: Teammate '{name}' already exists"

        # 添加到配置
        member = {
            "name": name,
            "role": role,
            "status": "working"
        }
        self.config["members"].append(member)
        self._save_config()

        # 启动线程
        thread = threading.Thread(
            target=self._teammate_loop,
            args=(name, role, prompt),
            daemon=True
        )
        thread.start()
        self.threads[name] = thread

        return f"Spawned teammate '{name}' (role: {role})"

    def _teammate_loop(self, name: str, role: str, prompt: str):
        """
        队友的独立执行循环

        每个队友有自己的 messages 上下文，通过收件箱与外部通信
        """
        messages = [{"role": "user", "content": prompt}]

        for _ in range(50):  # 最大50轮
            # 检查收件箱
            inbox = BUS.read_inbox(name)
            if inbox != "[]":
                messages.append({
                    "role": "user",
                    "content": f"<inbox>{inbox}</inbox>"
                })
                messages.append({
                    "role": "assistant",
                    "content": "Noted inbox messages."
                })

            # 调用 LLM
            response = client.messages.create(
                model=MODEL,
                system=TEAMMATE_SYSTEM.format(name=name, role=role),
                messages=messages,
                tools=TEAMMATE_TOOLS,  # 队友没有 spawn 工具
                max_tokens=8000
            )

            messages.append({"role": "assistant", "content": response.content})

            if response.stop_reason != "tool_use":
                break

            # 执行工具
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

        # 标记为空闲
        member = self._find_member(name)
        if member:
            member["status"] = "idle"
            self._save_config()

    def send_message(self, sender: str, to: str, content: str) -> str:
        """发送消息给队友"""
        if not self._find_member(to):
            return f"Error: Teammate '{to}' not found"
        return BUS.send(sender, to, content)

    def broadcast(self, sender: str, content: str) -> str:
        """广播消息给所有队友"""
        for member in self.config["members"]:
            if member["name"] != sender:
                BUS.send(sender, member["name"], content, "broadcast")
        return f"Broadcast sent to {len(self.config['members']) - 1} members"

    def list_teammates(self) -> str:
        """列出所有队友"""
        return json.dumps(self.config, indent=2)


# 全局实例
BUS = MessageBus()
TEAM = TeammateManager()

# 添加工具定义
TOOLS.extend([
    {
        "name": "spawn",
        "description": "Spawn a new teammate with a specific role",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "role": {"type": "string"},
                "prompt": {"type": "string"}
            },
            "required": ["name", "role", "prompt"]
        }
    },
    {
        "name": "send",
        "description": "Send a message to a teammate",
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {"type": "string"},
                "content": {"type": "string"}
            },
            "required": ["to", "content"]
        }
    },
    {
        "name": "broadcast",
        "description": "Broadcast a message to all teammates",
        "input_schema": {
            "type": "object",
            "properties": {
                "content": {"type": "string"}
            },
            "required": ["content"]
        }
    },
    {
        "name": "read_inbox",
        "description": "Read messages from inbox",
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    }
])

# 添加 handlers
TOOL_HANDLERS["spawn"] = lambda **kw: TEAM.spawn(kw["name"], kw["role"], kw["prompt"])
TOOL_HANDLERS["send"] = lambda **kw: TEAM.send_message("lead", kw["to"], kw["content"])
TOOL_HANDLERS["broadcast"] = lambda **kw: TEAM.broadcast("lead", kw["content"])
TOOL_HANDLERS["read_inbox"] = lambda **kw: BUS.read_inbox("lead")
```

## 第九、十、十一、十二步概述

由于篇幅限制，以下是后续步骤的核心思想概述。完整实现请参考项目仓库。

### 第十步：团队协议 (s10)

增加**结构化协调协议**：

| 协议 | 用途 |
|------|------|
| `shutdown_request/response` | 优雅关闭队友（带审批） |
| `plan_request/response` | 计划审批（高风险变更前审查） |

**状态机**: `pending -> approved | rejected`

### 第十一步：自治智能体 (s11)

实现**空闲循环 + 自动认领**：

```
Teammate lifecycle:
  WORKING -> IDLE -> WORKING -> ... -> SHUTDOWN

Idle phase actions:
  1. Check inbox -> new message? -> back to WORK
  2. Scan .tasks/ -> unclaimed? -> claim -> WORK
  3. 60s timeout -> SHUTDOWN
```

### 第十二步：Worktree 隔离 (s12)

**任务与执行环境的显式绑定**：

```
Control plane (.tasks/)             Execution plane (.worktrees/)
+------------------+                +------------------------+
| task_1.json      |                | auth-refactor/         |
|   status: in_progress  <------>   branch: wt/auth-refactor
|   worktree: "auth-refactor"   |   task_id: 1             |
+------------------+                +------------------------+
| task_2.json      |                | ui-login/              |
|   status: pending    <------>     branch: wt/ui-login
|   worktree: "ui-login"       |   task_id: 2             |
+------------------+                +------------------------+
```

每个任务获得：
- 独立的 Git worktree 目录
- 独立的 Git 分支
- 通过 `index.json` 和 `events.jsonl` 进行生命周期追踪

---

## 完整系统架构回顾

经过这12个步骤，我们构建了一个生产级的多智能体系统：

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Lead Agent (主智能体)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Agent Loop  │  │ Task System │  │ Context Compression │  │
│  │ (s01-s02)   │  │ (s03, s07)  │  │ (s06)               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Subagent A  │ │  Subagent B  │ │  Subagent C  │
    │  (Coder)     │ │  (Tester)    │ │  (Reviewer)  │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
              ┌─────────────────────────────┐
              │      Message Bus          │
              │    (.team/inbox/*.jsonl)  │
              └─────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Worktree A  │ │  Worktree B  │ │  Worktree C  │
    │  auth-wt/    │ │  ui-wt/      │ │  api-wt/     │
    └──────────────┘ └──────────────┘ └──────────────┘
```

## 完整代码清单

项目完整代码结构：

```
learn-agent/
├── agents/
│   ├── __init__.py
│   ├── s01_agent_loop.py          # 基础循环
│   ├── s02_tool_use.py            # 文件工具
│   ├── s03_todo_write.py          # 待办管理
│   ├── s04_subagent.py            # 子智能体
│   ├── s05_skill_loading.py       # 技能系统
│   ├── s06_context_compact.py     # 上下文压缩
│   ├── s07_task_system.py         # 任务系统
│   ├── s08_background_tasks.py    # 后台任务
│   ├── s09_agent_teams.py         # 智能体团队
│   ├── s10_team_protocols.py      # 团队协议
│   ├── s11_autonomous_agents.py   # 自治智能体
│   └── s12_worktree_task_isolation.py  # Worktree隔离
├── skills/
│   └── git/
│       └── SKILL.md
├── .env.example
├── requirements.txt
└── README.md
```

## 学习路径建议

1. **基础阶段** (s01-s04)：理解 Agent 循环、工具系统、任务管理和子智能体
2. **进阶阶段** (s05-s07)：掌握技能系统、上下文压缩和任务图
3. **高级阶段** (s08-s10)：学习后台任务、多智能体通信和协调协议
4. **专家阶段** (s11-s12)：实现自治执行和 Worktree 隔离

## 下一步

掌握了这些基础后，你可以：

1. **接入真实 API**：将 Anthropic Client 替换为 OpenAI、Gemini 等
2. **添加更多工具**：Web搜索、数据库操作、API调用等
3. **优化上下文管理**：实现更智能的上下文窗口策略
4. **生产化部署**：添加日志、监控、错误恢复等

祝你在构建 AI Agent 的旅程中探索愉快！
