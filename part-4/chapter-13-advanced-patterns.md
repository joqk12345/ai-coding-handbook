# 第11章：高级 Agent 模式

本章继续第10章的实战内容，深入讲解更高级的 Agent 设计模式，包括子智能体、任务系统、多智能体协作和自治执行等。

## 第七步：任务系统 (s07)

### 核心概念

> *"大目标要拆成小任务，排好序，记在磁盘上"* -- 文件持久化的任务图，为多 agent 协作打基础。

将扁平的待办列表升级为**带依赖关系的任务图**。

### 任务图结构

```
.tasks/
  task_1.json  {"id":1, "status":"completed"}
  task_2.json  {"id":2, "blockedBy":[1], "status":"pending"}
  task_3.json  {"id":3, "blockedBy":[1], "status":"pending"}
  task_4.json  {"id":4, "blockedBy":[2,3], "status":"pending"}

任务图 (DAG):
                 +----------+
            +--> | task 2   | --+
            |    | pending  |   |
+----------+     +----------+    +--> +----------+
| task 1   |                          | task 4   |
| completed| --> +----------+    +--> | blocked  |
+----------+     | task 3   | --+     +----------+
                 | pending  |
                 +----------+
```

### 实现代码

```python
import json
from pathlib import Path
from typing import Optional

TASKS_DIR = Path(".tasks")
TASKS_DIR.mkdir(exist_ok=True)


class TaskManager:
    """任务管理器 - 文件持久化的任务图"""

    def __init__(self, tasks_dir: Path = TASKS_DIR):
        self.dir = tasks_dir
        self.dir.mkdir(exist_ok=True)
        self._next_id = self._max_id() + 1

    def _max_id(self) -> int:
        """获取当前最大任务 ID"""
        max_id = 0
        for f in self.dir.glob("task_*.json"):
            try:
                task_id = int(f.stem.split("_")[1])
                max_id = max(max_id, task_id)
            except (ValueError, IndexError):
                continue
        return max_id

    def _save(self, task: dict):
        """保存任务到文件"""
        path = self.dir / f"task_{task['id']}.json"
        path.write_text(json.dumps(task, indent=2))

    def _load(self, task_id: int) -> dict:
        """从文件加载任务"""
        path = self.dir / f"task_{task_id}.json"
        if not path.exists():
            raise ValueError(f"Task {task_id} not found")
        return json.loads(path.read_text())

    def create(self, subject: str, description: str = "") -> str:
        """创建新任务"""
        task = {
            "id": self._next_id,
            "subject": subject,
            "description": description,
            "status": "pending",
            "blockedBy": [],
            "blocks": [],
            "owner": ""
        }
        self._save(task)
        self._next_id += 1
        return json.dumps(task, indent=2)

    def update(self, task_id: int, status: Optional[str] = None,
               add_blocked_by: Optional[int] = None,
               add_blocks: Optional[int] = None) -> str:
        """更新任务状态和依赖"""
        task = self._load(task_id)

        if status:
            task["status"] = status
            if status == "completed":
                self._clear_dependency(task_id)

        if add_blocked_by:
            if add_blocked_by not in task["blockedBy"]:
                task["blockedBy"].append(add_blocked_by)
            # 双向关联
            blocker = self._load(add_blocked_by)
            if task_id not in blocker["blocks"]:
                blocker["blocks"].append(task_id)
                self._save(blocker)

        if add_blocks:
            if add_blocks not in task["blocks"]:
                task["blocks"].append(add_blocks)
            # 双向关联
            blocked = self._load(add_blocks)
            if task_id not in blocked["blockedBy"]:
                blocked["blockedBy"].append(task_id)
                self._save(blocked)

        self._save(task)
        return json.dumps(task, indent=2)

    def _clear_dependency(self, completed_id: int):
        """清除已完成任务的依赖关系"""
        for f in self.dir.glob("task_*.json"):
            task = json.loads(f.read_text())
            if completed_id in task.get("blockedBy", []):
                task["blockedBy"].remove(completed_id)
                f.write_text(json.dumps(task, indent=2))

    def list_all(self) -> str:
        """列出所有任务"""
        tasks = []
        for f in sorted(self.dir.glob("task_*.json")):
            tasks.append(json.loads(f.read_text()))
        return json.dumps(tasks, indent=2)

    def get(self, task_id: int) -> str:
        """获取单个任务"""
        return json.dumps(self._load(task_id), indent=2)


# 全局任务管理器
TASKS = TaskManager()

# 添加到工具定义
TOOLS.extend([
    {
        "name": "task_create",
        "description": "Create a new task",
        "input_schema": {
            "type": "object",
            "properties": {
                "subject": {"type": "string"},
                "description": {"type": "string"}
            },
            "required": ["subject"]
        }
    },
    {
        "name": "task_update",
        "description": "Update task status or dependencies",
        "input_schema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer"},
                "status": {"type": "string", "enum": ["pending", "in_progress", "completed"]},
                "add_blocked_by": {"type": "integer"},
                "add_blocks": {"type": "integer"}
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "task_list",
        "description": "List all tasks",
        "input_schema": {"type": "object", "properties": {}}
    },
    {
        "name": "task_get",
        "description": "Get a specific task",
        "input_schema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer"}
            },
            "required": ["task_id"]
        }
    }
])

# 添加到 dispatch map
TOOL_HANDLERS["task_create"] = lambda **kw: TASKS.create(kw["subject"], kw.get("description", ""))
TOOL_HANDLERS["task_update"] = lambda **kw: TASKS.update(
    kw["task_id"],
    status=kw.get("status"),
    add_blocked_by=kw.get("add_blocked_by"),
    add_blocks=kw.get("add_blocks")
)
TOOL_HANDLERS["task_list"] = lambda **kw: TASKS.list_all()
TOOL_HANDLERS["task_get"] = lambda **kw: TASKS.get(kw["task_id"])
```

### 使用示例

```python
# 创建依赖任务链
"""
Create 3 tasks: "Setup project", "Write code", "Write tests".
Make them depend on each other in order.
"""

# Agent 执行:
# 1. task_create: "Setup project" -> task_1
# 2. task_create: "Write code" -> task_2, blockedBy=[1]
# 3. task_create: "Write tests" -> task_3, blockedBy=[2]

# 查看任务图
"""List all tasks and show the dependency graph"""

# 完成任务解锁后续
"""Complete task 1 and then list tasks to see task 2 unblocked"""
```

---

## 总结

通过以上步骤，我们构建了一个完整的 Agent 系统，核心能力包括：

| 步骤 | 核心能力 | 关键设计 |
|------|----------|----------|
| s01 | 基础循环 | `while True` + `stop_reason` |
| s02 | 工具扩展 | Dispatch Map + 路径沙箱 |
| s03 | 待办管理 | TodoManager + Nag 提醒 |
| s04 | 子智能体 | 干净上下文 + 摘要返回 |
| s05 | 技能加载 | 两层架构 + 按需注入 |
| s06 | 上下文压缩 | 三层压缩 + 磁盘转存 |
| s07 | 任务系统 | DAG + 文件持久化 |

下一章将继续介绍后台任务、多智能体协作、自治执行等高级主题。
