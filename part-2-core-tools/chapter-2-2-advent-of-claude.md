# 第2.2章：Advent of Claude - 31天掌握 Claude Code

> *一份全面的 Claude Code 功能指南，从快捷操作到高级智能体模式。*

作者发布于 X/Twitter 和 LinkedIn 的 "Advent of Claude" 系列，最初只是一个简单的圣诞日历式分享，最终演变成了一份详尽的 Claude Code 功能地图，这些功能从根本上改变了编写软件的方式。

本章将所有 31 个技巧汇编成一份综合指南，从初学者必备知识到高级模式进行了重新组织，并添加了 280 个字符无法涵盖的额外上下文。

无论你是刚刚入门还是希望提升 Claude Code 技能，这里都有适合你的内容。

---

## 准备工作

在深入了解功能之前，先让 Claude Code 了解你的项目。

### `/init` — 让 Claude 自动了解你的项目

每个人都需要入门文档。使用 `/init`，Claude 可以自己编写入门文档。

```bash
/init
```

Claude 会读取你的代码库并生成包含以下内容的 `CLAUDE.md` 文件：

- 构建和测试命令
- 关键目录及其用途
- 代码约定和模式
- 重要的架构决策

这是我在任何新项目中首先运行的命令。

对于大型项目，你还可以创建 `.claude/rules/` 目录，用于存放模块化的、特定主题的指令。该目录中的每个 `.md` 文件都会作为项目记忆与 `CLAUDE.md` 一起自动加载。你甚至可以使用 YAML frontmatter 根据文件路径有条件地应用规则：

```yaml
---
paths: src/api/**/*.ts
---
# API 开发规则
- 所有 API 端点必须包含输入验证
```

将 `CLAUDE.md` 视为你的通用项目指南，将 `.claude/rules/` 视为专注于测试、安全、API 设计或任何值得单独成文的主题的补充。

### 记忆更新

想要在不手动编辑 `CLAUDE.md` 的情况下保存某些内容到 Claude 的记忆中？

只需告诉 Claude 更新 `CLAUDE.md` 文件：

> "更新 Claude.md：在这个项目中始终使用 bun 而不是 npm"

继续编码，无需中断你的工作流程。

### @ 提及 — 即时添加上下文

`@` 提及是向 Claude 添加上下文的最快方式：

- `@src/auth.ts` — 即时添加文件到上下文
- `@src/components/` — 引用整个目录
- `@mcp:github` — 启用/禁用 MCP 服务器

在 git 仓库中，文件建议速度快约 3 倍，并支持模糊匹配。`@` 是从"我需要上下文"到"Claude 拥有上下文"的最快路径。

---

## 必备快捷操作

这些是你会经常使用的命令。把它们记到肌肉记忆中。

### `!` 前缀 — 即时运行 Bash

不要浪费 token 问"你能运行 git status 吗？"

只需输入 `!` 后跟你的 bash 命令：

```bash
! git status
! npm test
! ls -la src/
```

`!` 前缀即时执行 bash 并将输出注入上下文。没有模型处理。没有延迟。没有浪费的 token。不需要多个终端窗口。

这看起来很小，直到你意识到你每天要用它五十次。

### 双击 Esc 回退

想要尝试"如果我们要..."的方法而不承诺它吗？

尽管尝试。如果结果变得奇怪，按 Esc 两次跳转回一个干净的检查点。

你可以回退对话、代码更改，或两者都回退。需要注意的一点是，运行的 Bash 命令无法撤销。

### Ctrl + R — 反向搜索

你过去的提示是可搜索的：

| 按键 | 操作 |
|------|------|
| Ctrl+R | 开始反向搜索 |
| Ctrl+R（再次） | 循环浏览匹配项 |
| Enter | 运行它 |
| Tab | 编辑优先 |

不要重新输入。回忆。这也与斜杠命令无缝配合。

### 提示暂存

它就像 git stash，但用于你的提示。

Ctrl+S 保存你的草稿。发送其他内容。当你准备好时，你的草稿会自动恢复。

不再复制到暂存区。不再在中途对话时失去你的思路。

### 提示建议

Claude 可以预测你接下来会问什么。

完成一个任务，有时你会看到一个灰色的后续建议出现：

| 按键 | 操作 |
|------|------|
| Tab | 接受并编辑 |
| Enter | 立即接受并运行 |

Tab 过去用于自动完成你的代码。现在它自动完成你的工作流程。通过 `/config` 切换此功能。

---

## 会话管理

Claude Code 是一个持久的开发环境，针对你的工作流程进行优化将让你能做更多事情。

### 从上次离开的地方继续

不小心关闭了终端？笔记本在任务中途没电了？没问题。

```bash
claude --continue    # 立即恢复你上次的对话
claude --resume      # 显示一个选择器来选择任何过去的会话
```

上下文保留。动量恢复。你的工作永远不会丢失。你还可以通过 `cleanupPeriodDays` 设置自定义会话保留多长时间。默认是 30 天，但你可以设置任意长的时间，甚至是 0 如果你不想保留你的 Claude Code 会话。

### 命名会话

你的 git 分支有名称。你的 Claude 会话也应该有。

```bash
/rename api-migration       # 命名你当前的会话
/resume api-migration       # 通过名称恢复会话
claude --resume api-migration  # 也可以从命令行工作
```

`/resume` 屏幕将分叉的会话分组，并支持键盘快捷键：P 用于预览，R 用于重命名。

### Claude Code 远程

在 Web 上开始一个任务，在你的终端中完成：

```bash
# 在 claude.ai/code 上，开始一个 Claude Code 会话
# 它在你离开时后台运行

# 稍后，从你的终端：
claude --teleport session_abc123
```

这会拉取并在本地恢复会话。家里的 Claude 和移动中的 Claude。还可以通过 Claude iOS 和 Android 应用以及 Claude Desktop 应用工作。

### `/export` — 获取收据

有时你需要一份发生的事情记录。

`/export` 将整个对话转储为 markdown：

- 你发送的每个提示
- Claude 给出的每个回应
- 每个工具调用及其输出

非常适合文档、培训，或向过去的自己证明是的，你确实已经尝试过那个方法。

---

## 生产力功能

这些功能消除摩擦并帮助你更快地工作。

### Vim 模式

厌倦了伸手去拿鼠标来编辑你的提示？

输入 `/vim` 并解锁完整的 vim 风格编辑：

| 命令 | 操作 |
|------|------|
| h j k l | 导航 |
| ciw | 更改单词 |
| dd | 删除行 |
| w b | 按单词跳转 |
| A | 在行尾追加 |

以思考的速度编辑提示。你几十年来在 vim 中积累的肌肉记忆终于在 AI 工具中得到了回报。而且用 Claude Code 退出 vim 从未如此简单，只需再次输入 `/vim`。

### `/statusline` — 自定义你的视图

Claude Code 在你的终端底部有一个可自定义的状态栏。

`/statusline` 让你配置那里显示什么：

- Git 分支和状态
- 当前模型
- Token 使用情况
- 上下文窗口百分比
- 自定义脚本

一目了然的信息意味着更少的中断来手动检查事情。

### `/context` — Token 的 X 射线视觉

想知道是什么在消耗你的上下文窗口吗？

输入 `/context` 准确查看什么正在消耗你的 token：

- 系统提示大小
- MCP 服务器提示
- 记忆文件 (CLAUDE.md)
- 加载的技能和智能体
- 对话历史

当你的上下文开始填满时，这就是你找出它去哪里的方法。

### `/stats` — 你的使用仪表板

```
2023: "看看我的 GitHub 贡献图"
2025: "看看我的 Claude Code 统计"
```

输入 `/stats` 查看你的使用模式、最喜欢的模型、使用连续天数等。

橙色是新的绿色。

### `/usage` — 了解你的限制

"我快要达到限制了吗？"

```bash
/usage        → 用视觉进度条检查你当前的使用情况
/extra-usage  → 购买额外的容量
```

了解你的限制。然后超越它们。

---

## 思考与规划

控制 Claude 如何处理问题。

### Ultrathink

用一个关键词触发扩展思考：

```
> ultrathink: design a caching layer for our API
```

当你在提示中包含 `ultrathink` 时，Claude 在回应前分配最多 32k token 用于内部推理。对于复杂的架构决策或棘手的调试会话，这可能是表面级答案和真正洞察之间的区别。

过去你可以指定 `think`、`think harder` 和 `ultrathink` 来分配不同数量的 token 进行思考，但我们已经简化为单一的思考预算。`ultrathink` 关键字只在 `MAX_THINKING_TOKENS` 未设置时工作。当配置了 `MAX_THINKING_TOKENS` 时，它优先并控制所有请求的思考预算。

### Plan Mode

首先清除战争迷雾。

按 `Shift+Tab` 两次进入 Plan 模式。Claude 可以：

- 阅读和搜索你的代码库
- 分析架构
- 探索依赖关系
- 起草实施计划

但在你批准计划之前，它不会编辑任何东西。三思而后行。

我 90% 的时间默认使用 Plan 模式。最新版本让你在拒绝计划时提供反馈，使迭代更快。

### Extended Thinking (API)

当直接使用 Claude API 时，你可以启用扩展思考来查看 Claude 的逐步推理：

```javascript
thinking: { type: "enabled", budget_tokens: 5000 }
```

Claude 在回应前在 `thinking` 块中显示其推理。对于调试复杂逻辑或理解 Claude 的决策很有用。

---

## 权限与安全

没有控制的权力只是混乱。这些功能让你设置边界。

### Sandbox Mode

```
"我能运行 npm install 吗？" [允许]
"我能运行 npm test 吗？" [允许]
"我能 cat 这个文件吗？" [允许]
"我能摸摸那只狗吗？" [允许]
×100
```

`/sandbox` 让你一次性定义边界。Claude 在它们内部自由工作。

你获得了速度，同时有实际的安全性。最新版本支持通配符语法，如 `mcp__server__*` 用于允许整个 MCP 服务器。

### YOLO Mode

厌倦了 Claude Code 为所有事情征求许可？

```bash
claude --dangerously-skip-permissions
```

这个标志对一切都说"是"。它在名称中有"危险"是有原因的——明智地使用它，理想情况下在隔离环境中或用于受信任的操作。

### Hooks

Hooks 是在预定生命周期事件运行的 shell 命令：

- `PreToolUse` / `PostToolUse`：工具执行前后
- `PermissionRequest`：自动批准或拒绝权限请求
- `Notification`：响应 Claude 的通知
- `SubagentStart` / `SubagentStop`：监控智能体生成

通过 `/hooks` 或在 `.claude/settings.json` 中配置它们。

使用 Hooks 来阻止危险命令、发送通知、记录操作或与外部系统集成。这是对概率性 AI 的确定性控制。

---

## 自动化与 CI/CD

Claude Code 超越了交互式会话。

### Headless Mode

你可以将 Claude Code 用作脚本和自动化的强大 CLI 工具：

```bash
claude -p "Fix the lint errors"
claude -p "List all the functions" | grep "async"
git diff | claude -p "Explain these changes"
echo "Review this PR" | claude -p --json
```

AI 在你的管道中。`-p` 标志以非交互方式运行 Claude 并直接输出到 stdout。

### 命令 — 可重用提示

将任何提示保存为可重用命令：

创建 markdown 文件，它就变成了可以接受参数的斜杠命令：

```bash
/daily-standup              → 运行你的晨间例行提示
/explain $ARGUMENTS         → /explain src/auth.ts
```

停止重复自己。你最好的提示值得被重用。

### 浏览器集成

Claude Code 可以查看并与你的浏览器交互。

### Claude Code + Chrome

Claude 现在可以直接与 Chrome 交互：

- 导航页面
- 点击按钮和填写表单
- 读取控制台错误
- 检查 DOM
- 截图

"修复 bug 并验证它工作"现在是一个提示。从 claude.ai/chrome 安装 Chrome 扩展。

---

## 高级功能：智能体与可扩展性

这是 Claude Code 真正变得强大的地方。

### Subagents（子智能体）

圣诞老人不会自己包装每个礼物。他有精灵。

子智能体是 Claude 的精灵。每个都：

- 获得自己的 200k 上下文窗口
- 执行专门的任务
- 与其他并行运行
- 将输出合并回主智能体

像圣诞老人一样委派。子智能体可以在你继续工作时后台运行，它们可以完全访问 MCP 工具。

### Agent Skills（智能体技能）

技能是教 Claude 专门任务的指令、脚本和资源文件夹。

它们一次打包，到处可用。由于 Agent Skills 现在是开放标准，它们可以在任何支持它们的工具中工作。

把技能视为按需给 Claude 专业知识。无论是你公司的特定部署流程、测试方法还是文档标准。

### Plugins（插件）

还记得分享你的 Claude Code 设置意味着发送 47 个文件跨 12 个目录吗？

那个时代结束了。

```bash
/plugin install my-setup
```

插件将命令、智能体、技能、hooks 和 MCP 服务器捆绑到一个包中。通过市场发现新工作流，市场包括搜索过滤以便更容易发现。

### Language Server Protocol (LSP) 集成

Language Server Protocol (LSP) 支持让 Claude 获得 IDE 级别的代码智能：

LSP 集成提供：

- 即时诊断：每次编辑后 Claude 立即看到错误和警告
- 代码导航：转到定义、查找引用和悬停信息
- 语言感知：代码符号的类型信息和文档

Claude Code 现在像你的 IDE 一样理解你的代码。

### Claude Agent SDK

驱动 Claude Code 的相同智能体循环、工具和上下文管理现在可以作为 SDK 使用。只需 10 行代码即可构建像 Claude Code 一样工作的智能体：

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const msg of query({
  prompt: "Generate markdown API docs for all public functions in src/",
  options: {
    allowedTools: ["Read", "Write", "Glob"],
    permissionMode: "acceptEdits"
  }
})) {
  if (msg.type === 'result') console.log("Docs generated:", msg.result);
}
```

这只是开始。

---

## 快速参考

### 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `!command` | 立即执行 bash |
| `Esc Esc` | 回退对话/代码 |
| `Ctrl+R` | 反向搜索历史 |
| `Ctrl+S` | 暂存当前提示 |
| `Shift+Tab (×2)` | 切换计划模式 |
| `Alt+P` / `Option+P` | 切换模型 |
| `Ctrl+O` | 切换详细模式 |
| `Tab` / `Enter` | 接受提示建议 |

### 基本命令

| 命令 | 用途 |
|------|------|
| `/init` | 为你的项目生成 CLAUDE.md |
| `/context` | 查看 token 消耗 |
| `/stats` | 查看你的使用统计 |
| `/usage` | 检查速率限制 |
| `/vim` | 启用 vim 模式 |
| `/config` | 打开配置 |
| `/hooks` | 配置生命周期 hooks |
| `/sandbox` | 设置权限边界 |
| `/export` | 导出对话为 markdown |
| `/resume` | 恢复过去的会话 |
| `/rename` | 命名当前会话 |
| `/theme` | 打开主题选择器 |
| `/terminal-setup` | 配置终端集成 |

### CLI 标志

| 标志 | 用途 |
|------|------|
| `-p "prompt"` | 无头/打印模式 |
| `--continue` | 恢复上次会话 |
| `--resume` | 选择一个会话恢复 |
| `--resume name` | 通过名称恢复会话 |
| `--teleport id` | 恢复 web 会话 |
| `--dangerously-skip-permissions` | YOLO 模式 |

---

## 思考与规划

控制 Claude 如何处理问题。

### Ultrathink

用一个关键词触发扩展思考：

```
> ultrathink: design a caching layer for our API
```

当你在提示中包含 `ultrathink` 时，Claude 在回应前分配最多 32k token 用于内部推理。对于复杂的架构决策或棘手的调试会话，这可能是表面级答案和真正洞察之间的区别。

过去你可以指定 `think`、`think harder` 和 `ultrathink` 来分配不同数量的 token 进行思考，但我们已经简化为单一的思考预算。`ultrathink` 关键字只在 `MAX_THINKING_TOKENS` 未设置时工作。当配置了 `MAX_THINKING_TOKENS` 时，它优先并控制所有请求的思考预算。

### Plan Mode（计划模式）

首先清除战争迷雾。

按 `Shift+Tab` 两次进入 Plan 模式。Claude 可以：

- 阅读和搜索你的代码库
- 分析架构
- 探索依赖关系
- 起草实施计划

但在你批准计划之前，它不会编辑任何东西。三思而后行。

90% 的时间默认使用 Plan 模式。最新版本让你在拒绝计划时提供反馈，使迭代更快。

### Extended Thinking (API)

当直接使用 Claude API 时，你可以启用扩展思考来查看 Claude 的逐步推理：

```javascript
thinking: { type: "enabled", budget_tokens: 5000 }
```

Claude 在回应前在 `thinking` 块中显示其推理。对于调试复杂逻辑或理解 Claude 的决策很有用。

---

## 权限与安全

没有控制的权力只是混乱。这些功能让你设置边界。

### Sandbox Mode（沙盒模式）

```
"我能运行 npm install 吗？" [允许]
"我能运行 npm test 吗？" [允许]
"我能 cat 这个文件吗？" [允许]
"我能摸摸那只狗吗？" [允许]
×100
```

`/sandbox` 让你一次性定义边界。Claude 在它们内部自由工作。

你获得了速度，同时有实际的安全性。最新版本支持通配符语法，如 `mcp__server__*` 用于允许整个 MCP 服务器。

### YOLO Mode（YOLO 模式）

厌倦了 Claude Code 为所有事情征求许可？

```bash
claude --dangerously-skip-permissions
```

这个标志对一切都说"是"。它在名称中有"危险"是有原因的——明智地使用它，理想情况下在隔离环境中或用于受信任的操作。

### Hooks

Hooks 是在预定生命周期事件运行的 shell 命令：

- `PreToolUse` / `PostToolUse`：工具执行前后
- `PermissionRequest`：自动批准或拒绝权限请求
- `Notification`：响应 Claude 的通知
- `SubagentStart` / `SubagentStop`：监控智能体生成

通过 `/hooks` 或在 `.claude/settings.json` 中配置它们。

使用 Hooks 来阻止危险命令、发送通知、记录操作或与外部系统集成。这是对概率性 AI 的确定性控制。

---

## 自动化与 CI/CD

Claude Code 超越了交互式会话。

### Headless Mode（无头模式）

你可以将 Claude Code 用作脚本和自动化的强大 CLI 工具：

```bash
claude -p "Fix the lint errors"
claude -p "List all the functions" | grep "async"
git diff | claude -p "Explain these changes"
echo "Review this PR" | claude -p --json
```

AI 在你的管道中。`-p` 标志以非交互方式运行 Claude 并直接输出到 stdout。

### 命令 — 可重用提示

将任何提示保存为可重用命令：

创建 markdown 文件，它就变成了可以接受参数的斜杠命令：

```bash
/daily-standup              → 运行你的晨间例行提示
/explain $ARGUMENTS         → /explain src/auth.ts
```

停止重复自己。你最好的提示值得被重用。

### 浏览器集成

Claude Code 可以查看并与你的浏览器交互。

### Claude Code + Chrome

Claude 现在可以直接与 Chrome 交互：

- 导航页面
- 点击按钮和填写表单
- 读取控制台错误
- 检查 DOM
- 截图

"修复 bug 并验证它工作"现在是一个提示。从 claude.ai/chrome 安装 Chrome 扩展。

---

## 高级功能：智能体与可扩展性

这是 Claude Code 真正变得强大的地方。

### Subagents（子智能体）

圣诞老人不会自己包装每个礼物。他有精灵。

子智能体是 Claude 的精灵。每个都：

- 获得自己的 200k 上下文窗口
- 执行专门的任务
- 与其他并行运行
- 将输出合并回主智能体

像圣诞老人一样委派。子智能体可以在你继续工作时后台运行，它们可以完全访问 MCP 工具。

### Agent Skills（智能体技能）

技能是教 Claude 专门任务的指令、脚本和资源文件夹。

它们一次打包，到处可用。由于 Agent Skills 现在是开放标准，它们可以在任何支持它们的工具中工作。

把技能视为按需给 Claude 专业知识。无论是你公司的特定部署流程、测试方法还是文档标准。

### Plugins（插件）

还记得分享你的 Claude Code 设置意味着发送 47 个文件跨 12 个目录吗？

那个时代结束了。

```bash
/plugin install my-setup
```

插件将命令、智能体、技能、hooks 和 MCP 服务器捆绑到一个包中。通过市场发现新工作流，市场包括搜索过滤以便更容易发现。

### Language Server Protocol (LSP) 集成

Language Server Protocol (LSP) 支持让 Claude 获得 IDE 级别的代码智能：

LSP 集成提供：

- 即时诊断：每次编辑后 Claude 立即看到错误和警告
- 代码导航：转到定义、查找引用和悬停信息
- 语言感知：代码符号的类型信息和文档

Claude Code 现在像你的 IDE 一样理解你的代码。

### Claude Agent SDK

驱动 Claude Code 的相同智能体循环、工具和上下文管理现在可以作为 SDK 使用。只需 10 行代码即可构建像 Claude Code 一样工作的智能体：

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const msg of query({
  prompt: "Generate markdown API docs for all public functions in src/",
  options: {
    allowedTools: ["Read", "Write", "Glob"],
    permissionMode: "acceptEdits"
  }
})) {
  if (msg.type === 'result') console.log("Docs generated:", msg.result);
}
```

这只是开始。

---

## 快速参考

### 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `!command` | 立即执行 bash |
| `Esc Esc` | 回退对话/代码 |
| `Ctrl+R` | 反向搜索历史 |
| `Ctrl+S` | 暂存当前提示 |
| `Shift+Tab (×2)` | 切换计划模式 |
| `Alt+P` / `Option+P` | 切换模型 |
| `Ctrl+O` | 切换详细模式 |
| `Tab` / `Enter` | 接受提示建议 |

### 基本命令

| 命令 | 用途 |
|------|------|
| `/init` | 为你的项目生成 CLAUDE.md |
| `/context` | 查看 token 消耗 |
| `/stats` | 查看你的使用统计 |
| `/usage` | 检查速率限制 |
| `/vim` | 启用 vim 模式 |
| `/config` | 打开配置 |
| `/hooks` | 配置生命周期 hooks |
| `/sandbox` | 设置权限边界 |
| `/export` | 导出对话为 markdown |
| `/resume` | 恢复过去的会话 |
| `/rename` | 命名当前会话 |
| `/theme` | 打开主题选择器 |
| `/terminal-setup` | 配置终端集成 |

### CLI 标志

| 标志 | 用途 |
|------|------|
| `-p "prompt"` | 无头/打印模式 |
| `--continue` | 恢复上次会话 |
| `--resume` | 选择一个会话恢复 |
| `--resume name` | 通过名称恢复会话 |
| `--teleport id` | 恢复 web 会话 |
| `--dangerously-skip-permissions` | YOLO 模式 |

---

## 思考与规划

控制 Claude 如何处理问题。

### Ultrathink

用一个关键词触发扩展思考：

```
> ultrathink: design a caching layer for our API
```

当你在提示中包含 `ultrathink` 时，Claude 在回应前分配最多 32k token 用于内部推理。对于复杂的架构决策或棘手的调试会话，这可能是表面级答案和真正洞察之间的区别。

过去你可以指定 `think`、`think harder` 和 `ultrathink` 来分配不同数量的 token 进行思考，但我们已经简化为单一的思考预算。`ultrathink` 关键字只在 `MAX_THINKING_TOKENS` 未设置时工作。当配置了 `MAX_THINKING_TOKENS` 时，它优先并控制所有请求的思考预算。

### Plan Mode（计划模式）

首先清除战争迷雾。

按 `Shift+Tab` 两次进入 Plan 模式。Claude 可以：

- 阅读和搜索你的代码库
- 分析架构
- 探索依赖关系
- 起草实施计划

但在你批准计划之前，它不会编辑任何东西。三思而后行。

90% 的时间默认使用 Plan 模式。最新版本让你在拒绝计划时提供反馈，使迭代更快。

### Extended Thinking (API)

当直接使用 Claude API 时，你可以启用扩展思考来查看 Claude 的逐步推理：

```javascript
thinking: { type: "enabled", budget_tokens: 5000 }
```

Claude 在回应前在 `thinking` 块中显示其推理。对于调试复杂逻辑或理解 Claude 的决策很有用。

---

## 权限与安全

没有控制的权力只是混乱。这些功能让你设置边界。

### Sandbox Mode（沙盒模式）

```
"我能运行 npm install 吗？" [允许]
"我能运行 npm test 吗？" [允许]
"我能 cat 这个文件吗？" [允许]
"我能摸摸那只狗吗？" [允许]
×100
```

`/sandbox` 让你一次性定义边界。Claude 在它们内部自由工作。

你获得了速度，同时有实际的安全性。最新版本支持通配符语法，如 `mcp__server__*` 用于允许整个 MCP 服务器。

### YOLO Mode（YOLO 模式）

厌倦了 Claude Code 为所有事情征求许可？

```bash
claude --dangerously-skip-permissions
```

这个标志对一切都说"是"。它在名称中有"危险"是有原因的——明智地使用它，理想情况下在隔离环境中或用于受信任的操作。

### Hooks

Hooks 是在预定生命周期事件运行的 shell 命令：

- `PreToolUse` / `PostToolUse`：工具执行前后
- `PermissionRequest`：自动批准或拒绝权限请求
- `Notification`：响应 Claude 的通知
- `SubagentStart` / `SubagentStop`：监控智能体生成

通过 `/hooks` 或在 `.claude/settings.json` 中配置它们。

使用 Hooks 来阻止危险命令、发送通知、记录操作或与外部系统集成。这是对概率性 AI 的确定性控制。

---

## 自动化与 CI/CD

Claude Code 超越了交互式会话。

### Headless Mode（无头模式）

你可以将 Claude Code 用作脚本和自动化的强大 CLI 工具：

```bash
claude -p "Fix the lint errors"
claude -p "List all the functions" | grep "async"
git diff | claude -p "Explain these changes"
echo "Review this PR" | claude -p --json
```

AI 在你的管道中。`-p` 标志以非交互方式运行 Claude 并直接输出到 stdout。

### 命令 — 可重用提示

将任何提示保存为可重用命令：

创建 markdown 文件，它就变成了可以接受参数的斜杠命令：

```bash
/daily-standup              → 运行你的晨间例行提示
/explain $ARGUMENTS         → /explain src/auth.ts
```

停止重复自己。你最好的提示值得被重用。

### 浏览器集成

Claude Code 可以查看并与你的浏览器交互。

### Claude Code + Chrome

Claude 现在可以直接与 Chrome 交互：

- 导航页面
- 点击按钮和填写表单
- 读取控制台错误
- 检查 DOM
- 截图

"修复 bug 并验证它工作"现在是一个提示。从 claude.ai/chrome 安装 Chrome 扩展。

---

## 高级功能：智能体与可扩展性

这是 Claude Code 真正变得强大的地方。

### Subagents（子智能体）

圣诞老人不会自己包装每个礼物。他有精灵。

子智能体是 Claude 的精灵。每个都：

- 获得自己的 200k 上下文窗口
- 执行专门的任务
- 与其他并行运行
- 将输出合并回主智能体

像圣诞老人一样委派。子智能体可以在你继续工作时后台运行，它们可以完全访问 MCP 工具。

### Agent Skills（智能体技能）

技能是教 Claude 专门任务的指令、脚本和资源文件夹。

它们一次打包，到处可用。由于 Agent Skills 现在是开放标准，它们可以在任何支持它们的工具中工作。

把技能视为按需给 Claude 专业知识。无论是你公司的特定部署流程、测试方法还是文档标准。

### Plugins（插件）

还记得分享你的 Claude Code 设置意味着发送 47 个文件跨 12 个目录吗？

那个时代结束了。

```bash
/plugin install my-setup
```

插件将命令、智能体、技能、hooks 和 MCP 服务器捆绑到一个包中。通过市场发现新工作流，市场包括搜索过滤以便更容易发现。

### Language Server Protocol (LSP) 集成

Language Server Protocol (LSP) 支持让 Claude 获得 IDE 级别的代码智能：

LSP 集成提供：

- 即时诊断：每次编辑后 Claude 立即看到错误和警告
- 代码导航：转到定义、查找引用和悬停信息
- 语言感知：代码符号的类型信息和文档

Claude Code 现在像你的 IDE 一样理解你的代码。

### Claude Agent SDK

驱动 Claude Code 的相同智能体循环、工具和上下文管理现在可以作为 SDK 使用。只需 10 行代码即可构建像 Claude Code 一样工作的智能体：

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const msg of query({
  prompt: "Generate markdown API docs for all public functions in src/",
  options: {
    allowedTools: ["Read", "Write", "Glob"],
    permissionMode: "acceptEdits"
  }
})) {
  if (msg.type === 'result') console.log("Docs generated:", msg.result);
}
```

这只是开始。

---

## 快速参考

### 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `!command` | 立即执行 bash |
| `Esc Esc` | 回退对话/代码 |
| `Ctrl+R` | 反向搜索历史 |
| `Ctrl+S` | 暂存当前提示 |
| `Shift+Tab (×2)` | 切换计划模式 |
| `Alt+P` / `Option+P` | 切换模型 |
| `Ctrl+O` | 切换详细模式 |
| `Tab` / `Enter` | 接受提示建议 |

### 基本命令

| 命令 | 用途 |
|------|------|
| `/init` | 为你的项目生成 CLAUDE.md |
| `/context` | 查看 token 消耗 |
| `/stats` | 查看你的使用统计 |
| `/usage` | 检查速率限制 |
| `/vim` | 启用 vim 模式 |
| `/config` | 打开配置 |
| `/hooks` | 配置生命周期 hooks |
| `/sandbox` | 设置权限边界 |
| `/export` | 导出对话为 markdown |
| `/resume` | 恢复过去的会话 |
| `/rename` | 命名当前会话 |
| `/theme` | 打开主题选择器 |
| `/terminal-setup` | 配置终端集成 |

### CLI 标志

| 标志 | 用途 |
|------|------|
| `-p "prompt"` | 无头/打印模式 |
| `--continue` | 恢复上次会话 |
| `--resume` | 选择一个会话恢复 |
| `--resume name` | 通过名称恢复会话 |
| `--teleport id` | 恢复 web 会话 |
| `--dangerously-skip-permissions` | YOLO 模式 |

---

## 思考与规划

控制 Claude 如何处理问题。

### Ultrathink

用一个关键词触发扩展思考：

```
> ultrathink: design a caching layer for our API
```

当你在提示中包含 `ultrathink` 时，Claude 在回应前分配最多 32k token 用于内部推理。对于复杂的架构决策或棘手的调试会话，这可能是表面级答案和真正洞察之间的区别。

过去你可以指定 `think`、`think harder` 和 `ultrathink` 来分配不同数量的 token 进行思考，但我们已经简化为单一的思考预算。`ultrathink` 关键字只在 `MAX_THINKING_TOKENS` 未设置时工作。当配置了 `MAX_THINKING_TOKENS` 时，它优先并控制所有请求的思考预算。

### Plan Mode（计划模式）

首先清除战争迷雾。

按 `Shift+Tab` 两次进入 Plan 模式。Claude 可以：

- 阅读和搜索你的代码库
- 分析架构
- 探索依赖关系
- 起草实施计划

但在你批准计划之前，它不会编辑任何东西。三思而后行。

90% 的时间默认使用 Plan 模式。最新版本让你在拒绝计划时提供反馈，使迭代更快。

### Extended Thinking (API)

当直接使用 Claude API 时，你可以启用扩展思考来查看 Claude 的逐步推理：

```javascript
thinking: { type: "enabled", budget_tokens: 5000 }
```

Claude 在回应前在 `thinking` 块中显示其推理。对于调试复杂逻辑或理解 Claude 的决策很有用。

---

## 权限与安全

没有控制的权力只是混乱。这些功能让你设置边界。

### Sandbox Mode（沙盒模式）

```
"我能运行 npm install 吗？" [允许]
"我能运行 npm test 吗？" [允许]
"我能 cat 这个文件吗？" [允许]
"我能摸摸那只狗吗？" [允许]
×100
```

`/sandbox` 让你一次性定义边界。Claude 在它们内部自由工作。

你获得了速度，同时有实际的安全性。最新版本支持通配符语法，如 `mcp__server__*` 用于允许整个 MCP 服务器。

### YOLO Mode（YOLO 模式）

厌倦了 Claude Code 为所有事情征求许可？

```bash
claude --dangerously-skip-permissions
```

这个标志对一切都说"是"。它在名称中有"危险"是有原因的——明智地使用它，理想情况下在隔离环境中或用于受信任的操作。

### Hooks

Hooks 是在预定生命周期事件运行的 shell 命令：

- `PreToolUse` / `PostToolUse`：工具执行前后
- `PermissionRequest`：自动批准或拒绝权限请求
- `Notification`：响应 Claude 的通知
- `SubagentStart` / `SubagentStop`：监控智能体生成

通过 `/hooks` 或在 `.claude/settings.json` 中配置它们。

使用 Hooks 来阻止危险命令、发送通知、记录操作或与外部系统集成。这是对概率性 AI 的确定性控制。

---

## 自动化与 CI/CD

Claude Code 超越了交互式会话。

### Headless Mode（无头模式）

你可以将 Claude Code 用作脚本和自动化的强大 CLI 工具：

```bash
claude -p "Fix the lint errors"
claude -p "List all the functions" | grep "async"
git diff | claude -p "Explain these changes"
echo "Review this PR" | claude -p --json
```

AI 在你的管道中。`-p` 标志以非交互方式运行 Claude 并直接输出到 stdout。

### 命令 — 可重用提示

将任何提示保存为可重用命令：

创建 markdown 文件，它就变成了可以接受参数的斜杠命令：

```bash
/daily-standup              → 运行你的晨间例行提示
/explain $ARGUMENTS         → /explain src/auth.ts
```

停止重复自己。你最好的提示值得被重用。

### 浏览器集成

Claude Code 可以查看并与你的浏览器交互。

### Claude Code + Chrome

Claude 现在可以直接与 Chrome 交互：

- 导航页面
- 点击按钮和填写表单
- 读取控制台错误
- 检查 DOM
- 截图

"修复 bug 并验证它工作"现在是一个提示。从 claude.ai/chrome 安装 Chrome 扩展。

---

## 高级功能：智能体与可扩展性

这是 Claude Code 真正变得强大的地方。

### Subagents（子智能体）

圣诞老人不会自己包装每个礼物。他有精灵。

子智能体是 Claude 的精灵。每个都：

- 获得自己的 200k 上下文窗口
- 执行专门的任务
- 与其他并行运行
- 将输出合并回主智能体

像圣诞老人一样委派。子智能体可以在你继续工作时后台运行，它们可以完全访问 MCP 工具。

### Agent Skills（智能体技能）

技能是教 Claude 专门任务的指令、脚本和资源文件夹。

它们一次打包，到处可用。由于 Agent Skills 现在是开放标准，它们可以在任何支持它们的工具中工作。

把技能视为按需给 Claude 专业知识。无论是你公司的特定部署流程、测试方法还是文档标准。

### Plugins（插件）

还记得分享你的 Claude Code 设置意味着发送 47 个文件跨 12 个目录吗？

那个时代结束了。

```bash
/plugin install my-setup
```

插件将命令、智能体、技能、hooks 和 MCP 服务器捆绑到一个包中。通过市场发现新工作流，市场包括搜索过滤以便更容易发现。

### Language Server Protocol (LSP) 集成

Language Server Protocol (LSP) 支持让 Claude 获得 IDE 级别的代码智能：

LSP 集成提供：

- 即时诊断：每次编辑后 Claude 立即看到错误和警告
- 代码导航：转到定义、查找引用和悬停信息
- 语言感知：代码符号的类型信息和文档

Claude Code 现在像你的 IDE 一样理解你的代码。

### Claude Agent SDK

驱动 Claude Code 的相同智能体循环、工具和上下文管理现在可以作为 SDK 使用。只需 10 行代码即可构建像 Claude Code 一样工作的智能体：

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const msg of query({
  prompt: "Generate markdown API docs for all public functions in src/",
  options: {
    allowedTools: ["Read", "Write", "Glob"],
    permissionMode: "acceptEdits"
  }
})) {
  if (msg.type === 'result') console.log("Docs generated:", msg.result);
}
```

这只是开始。

---

## 结语

当我开始这个圣诞日历时，我以为我只是在分享技巧。但回顾这 31 天，我看到了更多的东西：一种人机协作的理念。

Claude Code 中最好的功能是让你掌控的功能。Plan 模式。智能体技能。Hooks。沙盒边界。会话管理。这些都是与 AI 协作的工具，而不是向它投降。

从 Claude Code 中获得最大收益的开发者不是那些输入"为我做所有事"的人。他们是那些学会了何时使用 Plan 模式、如何构建他们的提示、何时调用 `ultrathink` 以及如何设置能在错误发生前捕捉它们的 hooks 的人。

AI 是一个杠杆。这些功能帮助你找到正确的握点。AI 是一个杠杆，这些功能帮助你找到正确的握点。