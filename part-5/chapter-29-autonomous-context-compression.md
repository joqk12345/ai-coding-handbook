---
id: "part-5-chapter-29-autonomous-context-compression"
title: "第29章：自主上下文压缩——让 Agent 掌控自己的记忆"
slug: "part-5-chapter-29-autonomous-context-compression"
date: "2025-01-01"
type: "article"
topics: []
concepts: []
tools: []
architecture_layer:
  - "workflows-and-practices"
timeline_era: "autonomous-systems"
related: []
references: []
status: "published"
display_order: 99
---

# 第29章：自主上下文压缩——让 Agent 掌控自己的记忆

> 本文译自 Deep Agents 官方博客，介绍了一种让模型自主触发上下文压缩的工具，赋予 AI Agent 更多掌控自身工作记忆的能力。

## 摘要

我们在 Deep Agents SDK（Python）和 CLI 中添加了一个新工具，允许模型在合适的时机自主压缩上下文窗口。

## 背景与动机

上下文压缩是一种减少 Agent 工作内存信息的操作。老旧的消息被替换为摘要或精简的进度表示，保留与任务相关的核心内容。这种操作对于应对有限的上下文窗口和减少"上下文腐化"（context rot）往往是必要的。

现有的 Agent 框架通常通过固定阈值（如模型容量的 85%）来触发压缩。这种设计并非最优，因为压缩存在最佳时机和糟糕时机：

- 在复杂重构中途进行压缩并不理想；
- 在开始新任务或认为之前的上下文即将失去相关性时进行压缩效果更好。

许多交互式编码工具都提供 `/compact` 命令，让用户可以在合适的时机手动触发上下文压缩。我们更进一步，在最新的 `deepagents` 版本中向 Agent 暴露了一个工具，让它能够自主触发上下文压缩。这实现了更加机会主义的压缩，无需应用的用户关心有限的上下文窗口或发出特定命令。

该工具目前在 Deep Agents CLI 中默认启用，在 `deepagents` SDK 中可选开启。

我们坚信一个理念：框架应该尽可能"让开"，利用底层推理模型的改进。这是一个"苦涩教训"的实例：我们能否让 Agent 更好地控制自己的工作记忆，避免手工调优框架？

## 何时应该压缩？

存在多种可能需要上下文压缩的场景：

### 在清晰的任务边界处
- 用户表示要转向新任务，早期上下文可能不再相关
- Agent 完成了交付物，用户确认任务完成

### 从大量上下文中提取结果后
- Agent 通过消耗大量上下文获得了事实、结论、摘要或其他结果（如研究任务）

### 在消耗大量新上下文之前
- Agent 即将生成冗长的草稿
- Agent 即将读取大量新上下文

### 在进入复杂多步骤流程之前
- Agent 即将开始漫长的重构、迁移、多文件编辑或事故响应
- Agent 制定了计划，即将开始执行步骤

### 之前的上下文被新决策取代后
- 出现了使之前上下文失效的新需求
- 存在许多可以归纳为摘要的支线或死胡同

列出所有可能的场景并不现实，但我们的观察是：人类和 LLM 都能识别这些场景，并在合适的时机进行压缩，从而避免在上下文窗口接近极限时被迫进行压缩。

## 工具调用时会发生什么？

该工具的参数设置与现有的 Deep Agents 摘要中间件相同：我们保留最近的消息（可用上下文的 10%），并将之前的内容进行摘要。最近的消息（包括对压缩工具的调用及其响应）会保留在最近的上下文中。

## 如何使用

该工具实现为独立的中间件，因此你可以通过在 `create_deep_agent` 的中间件列表中添加它来启用：

```python
from deepagents import create_deep_agent
from deepagents.backends import StateBackend
from deepagents.middleware.summarization import (
    create_summarization_tool_middleware,
)

backend = StateBackend  # if using default backend

model = "openai:gpt-5.4"
agent = create_deep_agent(
    model=model,
    middleware=[
        create_summarization_tool_middleware(model, backend),
    ],
)
```

在 CLI 中，只需在准备好压缩上下文或转向新任务时调用 `/compact`。

## 我们的使用经验

我们调优这个功能时采取了保守的态度。Deep Agents 在其虚拟文件系统中保留了所有对话历史，允许在摘要后恢复上下文，但错误的上下文压缩步骤会造成干扰。我们测试了：

- **自定义评估套件**：我们使用（自己的）LangSmith traces 向需要和不需要压缩的线程注入后续提示；
- **Terminal-bench-2**：我们没有观察到自主压缩的案例；
- **我们自己在 Deep Agents CLI 中的编码任务**。

在实践中，Agent 对触发压缩持保守态度，但当它们这样做时，往往会选择明显改善工作流程的时机。

自主上下文压缩是一个小功能，但它指向了 Agent 设计的更广阔方向：让模型更多控制自己的工作记忆，减少框架中刚性、手工调优的规则。如果你正在构建长时间运行或交互式的 Agent，请在 Deep Agents SDK 或 CLI 中尝试一下，并告诉我们你的反馈以及你希望它接下来处理的模式。
