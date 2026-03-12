---
id: "part-5-chapter-27-harness-engineering-framework"
title: "第27章：Harness Engineering 框架——从漂移的 Agent 到复合的系统"
slug: "part-5-chapter-27-harness-engineering-framework"
date: "2025-01-01"
type: "article"
topics:
  - "Agent Harness"
  - "System Architecture"
  - "AI Engineering"
concepts:
  - "Context Architecture"
  - "Agent Specialization"
  - "Persistent Memory"
  - "Structured Execution"
  - "Guardrail Hierarchy"
tools:
  - "LangChain"
  - "OpenAI Codex"
  - "Claude Code"
architecture_layer:
  - "systems-and-governance"
timeline_era: "autonomous-systems"
related:
  - "part-5-chapter-20-harness-engineering"
  - "part-2-chapter-4-14-git-worktree-mode"
references: []
status: "published"
display_order: 97
---
# 第27章：Harness Engineering 框架——从漂移的 Agent 到复合的系统

> LangChain 的编程 Agent 在 Terminal Bench 2.0 上的得分从 52.8% 跃升至 66.5%——从 Top 30 跃升至 Top 5——而他们没有改变任何模型参数。他们改变的是 Harness。

---

## 行业的盲点

Gartner 预测，到 2027 年，超过 40% 的 Agentic AI 项目将被取消。七项独立研究证实，Agent 在处理复杂企业任务时的失败率高达 70-95%。

**共识观点认为模型是瓶颈。**

但当你真正测试时，模型已经成为商品。Claude、GPT-5、Gemini 2.5——它们的能力每季度都在趋同。那些正在交付生产级 Agent 的团队，胜在拥有最好的 Harness，而不是最好的模型访问权限。

**分岔路口：关键不在于你选择哪个模型，而在于你围绕模型构建什么系统。**

以下是 Harness Engineering 框架，它区分了那些漂移的 Agent 和那些能够复合价值的 Agent。

---

## 什么是 Harness

**Agent Harness 是围绕模型构建的基础设施，用于管理其运行方式——既不同于模型本身，也不同于提示词。**

OpenAI 构建了一个超过 100 万行代码的生产级应用，其中没有一行是由人类编写的。工程师们设计的是 Harness——约束、反馈循环、文档、代码检查器和生命周期管理，让模型能够可靠地编写代码。

**Harness 有三个职责：**

1. **上下文架构（Context Architecture）**——决定模型在每一步看到什么信息
2. **执行护栏（Execution Guardrails）**——强制执行模型能做什么和不能做什么
3. **记忆基础设施（Memory Infrastructure）**——确保模型从自身历史中学习

没有 Harness，模型在孤立环境中推理得很好，但在生产环境中失败。加上 Harness，你就拥有了一个能够复合价值的系统。

---

## 为什么巨型指令文件会失败

**典型模式：** 从一个 CLAUDE.md 或 AGENTS.md 开始，它逐渐增长成一部百科全书。每个边界情况都添加一条新规则，每次失败都添加一条新指令，最终文件达到 2000 行。模型开始忽略其中一半。

**上下文是稀缺资源。** 一个巨型指令文件挤占了任务、代码和相关文档的空间。当一切都"重要"时，就没有什么是重要的。

OpenAI 的 Codex 团队通过将他们的指令文件视为**目录**解决了这个问题。实际知识存储在一个结构化的 `docs/` 目录中。模型在正确的时间被指向正确的上下文——而不是在所有时间被淹没在所有上下文中。

**模式：**

- 保持根指令文件在 200 行以内
- 按主题在结构化目录中组织知识
- 使用**动态上下文注入**——为每个任务加载相关文档，而不是每个会话加载所有内容
- **积极修剪。** 如果一条规则在 30 天内没有阻止失败，就删除它

---

## 27.1 延伸阅读：Why AI Agents Need a Harness（Utah）

本章新增了独立子章节，专门解释 Harness 的工程隐喻与 Utah 的实践方法：

- [27.1 Why AI Agents Need a Harness：Lessons from Utah](./chapter-27-1-why-ai-agents-need-a-harness-lessons-from-utah.md)

建议在阅读本章“四大支柱”前，先阅读 27.1，建立对 Harness 作为“协调层/基础设施层”的整体认识。

---

## 四大支柱

Harness Engineering 建立在四大支柱之上。传统设置构建一两个。生产环境需要全部四个。

### 支柱1：上下文架构（Context Architecture）

**分层、渐进式披露。** 模型首先看到项目级上下文，然后是模块级，然后是文件级。它从不一次性看到所有内容。

**模式：**

| 层级 | 内容 | 加载时机 |
|------|------|----------|
| Layer 1 | 项目架构、约定、不变量 | 始终加载 |
| Layer 2 | 模块特定文档、模式、约束 | 按任务加载 |
| Layer 3 | 文件历史、最近变更、相关测试结果 | 按文件加载 |

**上下文预算：** 跟踪每层的 token 使用量，当任何层超过窗口的 40% 时发出警报。

### 支柱2：Agent 专业化（Agent Specialization）

**单一通用 Agent 无法扩展。** 生产系统使用专业化 Agent——职责狭窄，工具范围限定。

**模式：**

- 每个领域一个 Agent：代码生成、测试、审查、部署
- 每个 Agent 只获得它需要的工具——没有通用工具访问权限
- Agent 通过**结构化交接**通信，而不是共享上下文窗口
- 按 Agent 角色限定系统提示词。编写测试的 Agent 不需要部署指令

### 支柱3：持久记忆（Persistent Memory）

**会话历史在窗口关闭时消失。** 那不是记忆。真正的记忆存在于文件系统中。

**模式：**

| 文件 | 内容 |
|------|------|
| `decisions.md` | 架构决策及其理由和日期 |
| `failure-catalog.md` | 索引化的失败模式及其解决方案模式 |
| `session-state.md` | 上次会话改变了什么、哪些测试失败了、Agent 学到了什么 |

- Agent 在会话开始时读取记忆
- Agent 在会话结束时将结果写入记忆
- 记忆是**仅追加**的，用于审计追踪。通过单独的审查流程修剪

### 支柱4：结构化执行（Structured Execution）

**模型不应该从提示词直接跳到代码。** 结构化执行强制执行工作流：研究 → 计划 → 执行 → 验证。

**模式：**

| 步骤 | 活动 |
|------|------|
| Step 1 | Agent 读取相关上下文和记忆 |
| Step 2 | Agent 生成计划（要改哪些文件、要写哪些测试、存在哪些风险） |
| Step 3 | 在关键路径上，执行前审查计划 |
| Step 4 | Agent 在护栏下执行（每会话最大文件数、受保护文件列表、部署前模拟） |
| Step 5 | Agent 运行验证（测试、代码检查、安全扫描） |
| Step 6 | Agent 将会话结果写入记忆 |

---

## 护栏层级（The Guardrail Hierarchy）

护栏作为 Agent 无法覆盖的硬性策略执行——要像对待硬性政策执行一样对待它们。

```
guardrail-stack/
├── hard-limits/           # 硬性限制
│   ├── cost-ceiling.md    # 每会话最大花费
│   ├── duration-limit.md  # 自动暂停前的最大运行时间
│   ├── file-budget.md     # 每会话最大变更文件数
│   └── tool-allowlist.md  # 只有这些工具可用
├── safety-nets/           # 安全网
│   ├── simulation-gate.md # 每次部署前模拟
│   ├── test-gate.md       # 提交前测试必须通过
│   ├── review-gate.md     # 关键路径人工审查
│   └── rollback-plan.md   # 失败时自动回滚
├── golden-paths/            # 黄金路径
│   ├── code-patterns.md     # 每门语言的批准模式
│   ├── architecture-rules.md # 系统边界约束
│   └── naming-conventions.md # 一致的命名执行
└── audit/                   # 审计
    ├── action-log.md          # 每个 Agent 动作带时间戳
    ├── cost-tracker.md        # 累积花费追踪
    └── decision-trail.md     # Agent 为何选择每个动作
```

**层级很重要。** 硬性限制不能被 Agent 放宽。安全网在失败到达生产环境前捕获它们。黄金路径引导 Agent 走向正确的模式。审计确保你可以重建发生了什么。

---

## 复利效应

没有 Harness 的 Agent 每次会话都从零点开始——重新发现模式、重复错误、不带任何机构知识。

有 Harness 的 Agent **复合价值**。

每次会话都添加到失败目录，每个决策都记录理由，每个交互模式都被索引以供重用。

OpenAI 的 Codex 团队报告称，他们的 Harness 驱动 Agent 随时间变得更加可靠——不是因为模型改进了，而是因为 Harness 积累了让模型工作更轻松的上下文。

**这才是真正的护城河。** 模型是可互换的。Harness 不是。六个月积累的上下文、失败模式和架构决策无法通过切换到新模型或新框架来复制。

---

## 生产环境检查清单

### 上下文架构
- [ ] 根指令文件在 200 行以内
- [ ] 知识按主题组织在结构化目录中
- [ ] 动态上下文注入按任务加载相关文档
- [ ] 每层上下文预算带警报追踪
- [ ] 每月修剪过时规则

### Agent 专业化
- [ ] 代码生成、测试、审查的独立 Agent
- [ ] 每个 Agent 有作用域工具访问（无通用工具）
- [ ] Agent 间结构化交接文档化
- [ ] 按 Agent 角色限定系统提示词

### 持久记忆
- [ ] 决策、失败、会话状态存储在文件系统中
- [ ] Agent 会话开始时读取记忆
- [ ] Agent 会话结束时写入记忆
- [ ] 记忆仅追加，单独修剪流程

### 结构化执行
- [ ] 研究 → 计划 → 执行 → 验证 工作流强制执行
- [ ] 关键路径执行前计划审查
- [ ] 每会话最大文件预算强制执行
- [ ] 受保护文件列表防止未授权修改
- [ ] 每次执行步骤后验证运行

### 护栏
- [ ] 每会话成本上限强制执行
- [ ] 持续时间限制带自动暂停
- [ ] 每次部署动作前模拟
- [ ] 任何提交前测试必须通过
- [ ] 每个 Agent 动作完整审计日志

---

## 对构建者的意义

**模型层正在快速商品化。** GPT-5、Claude Opus、Gemini 2.5——能力差距每季度都在缩小。卡内基梅隆大学发现 Agent 仅能完成 24% 的标准办公任务，而失败源于基础设施，而非智能。

**获胜的团队正在构建 Harness，而非购买模型。** LangChain 证明了这一点：相同模型，更好的 Harness，Top 5。

**随着模型改进，Harness Engineering 变得更加重要**——因为更好的模型解锁更多自主性，而更多自主性需要更好的护栏。

**Harness 是产品。模型是引擎。没人仅仅为了引擎而买车。**

---

## 你的下一步

**你的当前 Agent 设置缺少的第一个护栏是什么？**

以及——**你最喜欢的 Harness 是什么？**
