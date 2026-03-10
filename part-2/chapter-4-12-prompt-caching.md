---
id: "part-2-chapter-4-12-prompt-caching"
title: "5.12: Lessons from Building Claude Code - Prompt 缓存即一切"
slug: "part-2-chapter-4-12-prompt-caching"
date: "2025-01-01"
type: "article"
topics: []
concepts: []
tools: []
architecture_layer:
  - "models-and-tools"
timeline_era: "autonomous-systems"
related: []
references: []
status: "published"
display_order: 36
---
# 5.12: Lessons from Building Claude Code — Prompt 缓存即一切

> *It is often said in engineering that "Cache Rules Everything Around Me", and the same rule holds for agents.*

## 一、为什么 Prompt 缓存至关重要

像 Claude Code 这样的长时运行 Agent 产品，Prompt 缓存使其成为可能——它允许复用前一轮的计算结果，显著降低延迟和成本。

### 1.1 什么是 Prompt 缓存

Prompt 缓存是一种通过前缀匹配实现的缓存机制。API 会缓存从请求开始到每个 `cache_control` 断点之间的所有内容。这意味着**内容的顺序至关重要**——越多的请求共享相同前缀，缓存命中率就越高。

### 1.2 Claude Code 的缓存架构

Claude Code 的 Prompt 按照以下顺序组织，以最大化缓存命中：

```
静态 System Prompt + Tools（全局缓存）→ Claude.MD（项目内缓存）→ Session Context（会话缓存）→ Conversation Messages
```

这种层次结构确保了不同会话之间的缓存共享。

## 二、Claude Code 的缓存优化经验

### 2.1 精心布局 Prompt 以支持缓存

**核心原则：静态内容在前，动态内容在后。**

Claude Code 团队发现，以下操作会破坏缓存顺序：
- 在静态 System Prompt 中添加详细时间戳
- 非确定性随机打乱 Tool 定义顺序
- 动态更新 Tool 参数（如 AgentTool 可调用的 Agent 列表）

### 2.2 使用 Messages 而非修改 System Prompt

当 System Prompt 中的信息变得过时（如时间变化或用户修改了文件），直接修改 System Prompt 会导致缓存未命中，成本高昂。

**更好的做法**：在下一轮的用户消息或 Tool Result 中使用 `<system-reminder>` 标签传递更新信息。例如：

```xml
<system-reminder>
It is now Wednesday, 2024-01-15. The file user.json was modified.
</system-reminder>
```

### 2.3 不要在会话中途更换模型

Prompt 缓存与模型一一对应，这使得缓存数学计算变得反直觉。

**关键洞察**：如果你与 Opus 进行了 100k tokens 的对话，现在想切换到 Haiku 回答一个简单问题，实际上比继续用 Opus 回答更贵——因为需要为 Haiku 重建整个 Prompt 缓存。

**正确做法**：使用 Subagent。Opus 可以准备一个"交接消息"给另一个模型执行任务。Claude Code 的 Explore Agent 就采用这种方式，使用 Haiku 处理轻量任务。

### 2.4 永远不要在会话中途添加工具或删除工具

这是破坏 Prompt 缓存最常见的方式之一。直觉上"只给模型当前需要的工具"似乎合理，但因为工具是缓存前缀的一部分，添加或删除工具会使整个会话的缓存失效。

### 2.5 Plan Mode — 围绕缓存设计功能

Plan Mode 是围绕缓存约束设计功能的绝佳案例。

**直觉做法**：用户进入 Plan Mode 时，切换到仅包含只读工具的工具集。

**问题**：这会破坏缓存。

**正确做法**：保持所有工具在请求中始终存在，使用 EnterPlanMode 和 ExitPlanMode 作为工具本身。当用户开启 Plan Mode 时，Agent 收到一条系统消息解释它处于 Plan Mode 模式以及指令——探索代码库，不要编辑文件，完成计划时调用 ExitPlanMode。工具定义从不改变。

**额外收益**：因为 EnterPlanMode 是模型可以自行调用的工具，当模型检测到难题时，它可以自主进入 Plan Mode，无需任何缓存中断。

### 2.6 Tool Search — 延迟加载而非删除

同样的原则适用于 Tool Search 功能。Claude Code 可能加载数十个 MCP 工具，将所有工具包含在每个请求中会很昂贵。但在会话中途删除它们会破坏缓存。

**解决方案**：使用 `defer_loading`。不删除工具，而是发送轻量级存根——仅包含工具名称和 `defer_loading: true`。模型可以通过 ToolSearch 工具"发现"它们。仅当模型选择使用它们时，才加载完整的工具 Schema。这保持了缓存前缀稳定：相同的存根始终以相同顺序存在。

### 2.7 Forking Context — Compaction

Compaction 发生在上下文窗口耗尽时。我们总结迄今为止的对话，并在新的会话中继续。

有趣的是，Compaction 与 Prompt 缓存有很多边缘情况，可能非常反直觉。

**关键问题**：Compaction 需要将整个对话发送给模型生成摘要。如果这是使用不同 System Prompt 和没有工具的单独 API 调用（简单实现），父对话的缓存前缀完全不匹配。你需要为所有这些输入 Token 支付全价，大大增加用户成本。

**解决方案 — 缓存安全的 Forking**

当运行 Compaction 时，我们使用与父对话完全相同的 System Prompt、用户上下文、系统上下文和工具定义。我们在父对话的消息前序言，然后在水龙头末尾附加 Compaction Prompt 作为新的用户消息。

从 API 的角度看，这个请求与父对话的最后一次请求几乎相同——相同的前缀、相同的工具、相同的历史——所以缓存前缀被复用。唯一的新 Token 是 Compaction Prompt 本身。

这意味着我们需要保存一个"Compaction Buffer"，以便在上下文窗口中有足够的空间包含 Compaction 消息和摘要输出 Token。

## 三、核心经验总结

| 原则 | 说明 |
|------|------|
| **Prompt 缓存是前缀匹配** | 前缀中任何位置的任何更改都会使之后的所有内容失效 |
| **使用消息而非 System Prompt 更改** | 进入 Plan Mode、更改日期等操作，通过消息插入更好 |
| **不要在会话中途更换工具或模型** | 使用工具进行模型状态转换（如 Plan Mode），而不是更改工具集。延迟工具加载而非删除 |
| **像监控正常运行时间一样监控缓存命中率** | 缓存未命中被视为事件。几个百分点的缓存未命中率会大幅影响成本和延迟 |
| **Fork 操作需要共享父级前缀** | 如果需要运行并行计算（Compaction、摘要、技能执行），使用相同的缓存安全参数以获得父级前缀的缓存命中 |

## 四、架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Prompt 缓存架构                            │
├─────────────────────────────────────────────────────────────┤
│  Static System Prompt + Tools    ←── 全局缓存（最高优先级）    │
│  ──────────────────────────────                             │
│  Claude.MD (项目配置)            ←── 项目级缓存               │
│  ──────────────────────────────                             │
│  Session Context (会话状态)       ←── 会话级缓存              │
│  ──────────────────────────────                             │
│  Conversation Messages            ←── 每轮更新               │
└─────────────────────────────────────────────────────────────┘

缓存命中场景：
┌─────────────────────────────────────────────────────────────┐
│  请求 A: [███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 100% 缓存  │
│  请求 B: [████████████░░░░░░░░░░░░░░░░░░░░░░] 80% 缓存     │
│  请求 C: [████████████████████████████░░░░░░] 60% 缓存     │
└─────────────────────────────────────────────────────────────┘
```

## 五、实践建议

如果你正在构建 Agent，应该从第一天起就像 Claude Code 一样围绕 Prompt 缓存设计：

1. **静态内容优先**：将不变的内容放在前面
2. **避免动态修改**：使用消息传递更新而非修改 System Prompt
3. **工具集稳定**：定义好工具集后不要轻易更改
4. **监控缓存命中率**：将其作为关键运维指标
5. **使用 Subagent 进行模型切换**：而非直接更换主模型
6. **延迟加载大型工具集**：使用存根和发现机制

Prompt 缓存不是事后考虑——它是 Agent 架构的核心设计原则。