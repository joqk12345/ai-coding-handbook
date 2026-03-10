---
id: "part-2-chapter-4-7-advanced-features"
title: "5.7: 高级功能与使用技巧"
slug: "part-2-chapter-4-7-advanced-features"
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
display_order: 43
---
# 5.7: 高级功能与使用技巧

在开发环境中使用 Claude 时，我们经常需要对现有项目进行修改。本章介绍高效实现变更的实用技巧，包括通过截图进行视觉化沟通，以及充分利用 Claude 的高级推理能力。

## 使用截图进行精确沟通

与 Claude 沟通最有效的方式之一是通过截图。当你想要修改界面的特定部分时，截图可以帮助 Claude 准确理解你所指的内容。

要在 Claude 中粘贴截图，请使用 **Ctrl+V**（在 macOS 上不是 Cmd+V）。这个键盘快捷键专门用于将截图粘贴到聊天界面中。粘贴图像后，你可以要求 Claude 对应用程序的该区域进行特定更改。

## 规划模式（Planning Mode）

对于需要在代码库中进行广泛研究的复杂任务，你可以启用规划模式。此功能让 Claude 在实施更改之前对你的项目进行彻底的探索。

通过按 **Shift + Tab 两次**启用规划模式（如果你已经在自动接受编辑，则按一次）。在此模式下，Claude 将：

- 读取项目中的更多文件
- 创建详细的实施计划
- 准确展示它打算做什么
- 在继续之前等待你的批准

这让你有机会审查计划，如果 Claude 遗漏了某些重要内容或没有考虑特定场景，你可以进行重定向。

## 思考模式（Thinking Modes）

Claude 通过"思考"模式提供不同级别的推理能力。这些模式允许 Claude 在提供解决方案之前花费更多时间对复杂问题进行推理。

可用的思考模式包括：

| 模式 | 说明 |
|------|------|
| Think | 基础推理 |
| Think more | 扩展推理 |
| Think a lot | 全面推理 |
| Think longer | 延长时间推理 |
| Ultrathink | 最大推理能力 |

每种模式为 Claude 提供 progressively 更多的 Token 来使用，从而能够对具有挑战性的问题进行更深入的分析。

## 何时使用规划模式 vs 思考模式

这两种功能处理不同类型的复杂性：

**规划模式最适合：**

- 需要对代码库有广泛理解的任务
- 多步骤实施
- 影响多个文件或组件的更改

**思考模式最适合：**

- 复杂的逻辑问题
- 调试困难的问题
- 算法挑战

对于需要广度和深度的任务，你可以结合使用两种模式。请记住，这两种功能都会消耗额外的 Token，因此使用它们时需要考虑成本因素。
