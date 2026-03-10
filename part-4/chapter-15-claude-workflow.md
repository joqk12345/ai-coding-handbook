# 第16章：Claude Code Workflow —— 经过实战检验的 Agent 工作流模板

> *经过 3 个月每日使用验证的工作流模板，将 Claude 转化为持久、自我改进的开发伙伴。*

## 概述

**Claude Code Workflow** 是一个经过实战检验的工作流模板，源自 3 个月的每日使用经验。它将 Claude 转化为一个**持久、自我改进的开发伙伴**，具有结构化内存管理、上下文工程和任务路由功能。

## 核心理念

这个工作流遵循几个核心原则：

| 原则 | 描述 |
|------|------|
| **Structure > Prompting** | 结构化优于提示工程 |
| **Memory > Intelligence** | 记忆优于智能 |
| **Auto-save > Manual Save** | 自动保存优于手动保存 |

## 分层架构

工作流采用**分层架构**来优化 Token 使用：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code Workflow                         │
├─────────────────────────────────────────────────────────────────┤
│  Layer 0: Auto-loaded Rules (~2K tokens)                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ behaviors.md    │ │ skill-triggers  │ │ memory-flush    │   │
│  │ 核心行为规则    │ │ 技能触发器      │ │ 自动保存触发器  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: On-demand Docs (~1-3K tokens each)                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ agents.md       │ │ task-routing.md │ │ content-safety  │   │
│  │ 多模型协作框架  │ │ 模型层级路由    │ │ AI 幻觉预防     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: Hot Data (Working Memory)                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ today.md        │ │ projects.md     │ │ goals.md        │   │
│  │ 每日会话日志    │ │ 跨项目状态概览  │ │ 周/月/季度目标  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│  ┌─────────────────┐                                            │
│  │ active-tasks    │                                            │
│  │ 跨会话任务注册  │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 0：自动加载的规则

### 始终在上下文中（约 2K tokens）

#### rules/behaviors.md
核心行为规则，包括：
- 调试规则
- 提交规则
- 任务路由规则

#### rules/skill-triggers.md
基于条件自动调用技能的触发器。例如：
- 当检测到特定模式时自动激活相应技能
- 根据上下文环境触发相应的处理流程

#### rules/memory-flush.md
自动保存触发器，防止工作进度丢失。确保：
- 定期将内存内容持久化
- 在关键节点自动保存状态

---

## Layer 1：按需加载的文档

### 需要时加载（每个约 1-3K tokens）

#### docs/agents.md
多模型协作框架。定义：
- 不同 Agent 的角色和职责
- Agent 之间的通信协议
- 协作流程和任务分发机制

#### docs/task-routing.md
模型层级路由 + 成本比较。包含：
- 何时使用 Opus/Sonnet/Haiku/Codex/Local
- 任务复杂度与模型选择
- 成本优化策略

#### docs/content-safety.md
AI 幻觉预防系统。包括：
- 输出验证规则
- 事实检查流程
- 不确定性检测机制

---

## Layer 2：热数据

### 工作内存

#### memory/today.md
每日会话日志，记录：
- 当天完成的任务
- 遇到的问题和解决方案
- 学习和改进的要点

#### memory/projects.md
跨项目状态概览：
- 所有项目的当前状态
- 正在进行的工作
- 待处理的事项

#### memory/goals.md
周/月/季度目标：
- 短期和长期目标
- 里程碑和截止日期
- 进度跟踪

#### memory/active-tasks.json
跨会话任务注册表：
- 持久化的任务列表
- 任务状态跟踪
- 跨会话恢复能力

---

## 核心功能

### 1. 持久记忆
**Remembers past mistakes and applies lessons automatically**

- 记住过去的错误并自动应用经验教训
- 跨会话保持上下文一致性
- 不断积累和优化工作流程

### 2. 上下文管理
**Manages context across long sessions without drifting**

- 长时间会话中保持上下文稳定
- 防止上下文膨胀和漂移
- 智能压缩和清理机制

### 3. 任务路由
**Routes to appropriate model tier**

根据任务复杂度选择合适的模型层级：

| 模型 | 适用场景 | 成本 |
|------|----------|------|
| Opus | 复杂推理、架构设计 | 高 |
| Sonnet | 日常开发任务 | 中 |
| Haiku | 简单查询、快速验证 | 低 |
| Codex | 代码生成、调试 | 中 |
| Local | 隐私敏感、本地运行 | 低 |

### 4. 验证要求
**Cannot claim completion without running verification**

任何任务完成前必须：
1. 运行验证命令
2. 确认输出正确性
3. 记录验证结果

### 5. 自动保存
**Prevents progress loss with automatic saves**

- 定期自动保存工作进度
- 关键节点强制保存
- 崩溃恢复能力

### 6. 分层加载
**Optimizes token usage**

- 规则始终加载（约 2K tokens）
- 文档按需加载（每个 1-3K tokens）
- 数据在需要时加载

---

## 使用方法

### 1. 克隆模板

```bash
git clone https://github.com/runesleo/claude-code-workflow.git
```

### 2. 复制到配置目录

```bash
cp -r claude-code-workflow/* ~/.claude/
```

### 3. 自定义 CLAUDE.md

在 `CLAUDE.md` 中添加：
- 用户信息
- 项目映射
- 单一可信源（SSOT）定义

### 4. 开始会话

```bash
claude
```

---

## 自定义选项

### 添加项目

1. 添加到 `memory/projects.md`
2. 在 `CLAUDE.md` 的子项目内存路由中注册
3. 创建 `PROJECT_CONTEXT.md` 文件

### 添加技能

在 `skills/your-skill/SKILL.md` 中创建：
```yaml
---
name: your-skill
triggers:
  - pattern: "..."
action: "..."
---
```

### 添加 Agent

在 `agents/your-agent.md` 中创建：
```yaml
---
name: your-agent
role: "..."
capabilities:
  - "..."
personality: "..."
---
```

### 调整路由

修改以下文件：
- `rules/behaviors.md`
- `docs/task-routing.md`

---

## 减少 AI 编码失败模式

这个工作流模板通过以下方式减少常见的 AI 编码失败：

| 失败模式 | 解决方案 |
|----------|----------|
| 上下文漂移 | 分层加载 + 自动保存 |
| 幻觉输出 | 内容安全规则 + 验证要求 |
| 任务遗忘 | 持久记忆 + 跨会话任务注册 |
| 模型选择不当 | 智能任务路由 + 成本优化 |
| 进度丢失 | 自动保存触发器 |

---

## 技术要求

| 组件 | 要求 |
|------|------|
| Claude Code CLI | Claude Max 或 API 订阅 |
| Codex CLI（可选） | 跨验证 |
| Ollama（可选） | 本地模型回退 |

---

## 参考资源

- [Claude Code Workflow - GitHub](https://github.com/runesleo/claude-code-workflow) - 官方项目仓库
- [第17章：从怀疑者到信徒](./chapter-17-skeptic-believer.md)
- [第4.3章：Agent Skills（智能体技能）入门](../part-2/chapter-4-3-agent-skills.md)
- [第4.6章：实战中上下文的管理与添加](../part-2/chapter-4-6-context-management.md)
