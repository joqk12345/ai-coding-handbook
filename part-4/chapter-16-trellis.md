# 第15章：Trellis —— 为 AI 设置规则的开放框架

> *Trellis 补上了 CLAUDE.md/AGENTS.md 之外的结构：分层 Spec、任务上下文、workspace 记忆，以及按平台接入的工作流。*

## 概述

**Trellis** 是一个开源的"为 AI 设置规则"框架，支持 10+ AI 编程工具，包括 Claude Code、Cursor、 Gemini CLI 等。

## 核心特性

### 1. 自动注入 Spec
**Auto-inject Spec**

自动加载相关的项目上下文，无需重复解释。这意味着：
- 一次配置，多次使用
- 团队成员无需重复了解项目规范
- 新加入者可以快速理解项目结构

### 2. 任务驱动的工作流
**Task-driven workflows**

将 PRD（产品需求文档）、上下文和任务状态组织在 `.trellis/tasks/` 中。

```
.trellis/tasks/
├── task-001.md      # 任务 PRD
├── task-002.md      # 任务 PRD
└── status.json      # 任务状态跟踪
```

### 3. 并行 Agent 执行
**Parallel Agent execution**

使用 git worktrees 运行多个 AI 任务，无需分支混乱。

```
┌─────────────────────────────────────────────────────────────────┐
│                     Trellis 并行执行架构                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   主分支 (main)                                                 │
│        │                                                        │
│   ┌────┼────┐                                                  │
│   ▼    ▼    ▼                                                  │
│ ┌────┐┌────┐┌────┐                                            │
│ │task││task││task│  ← 每个任务独立 worktree                    │
│ │-001││-002││-003│                                            │
│ └────┘└────┘└────┘                                            │
│                                                                 │
│  优点：无分支冲突、并行执行、结果聚合                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4. 项目记忆
**Project memory**

在 `.trellis/workspace/` 日志中保留工作历史。

```
.trellis/workspace/
├── 2024-01/
│   ├── session-001.md   # 会话记录
│   └── session-002.md
├── 2024-02/
│   └── session-003.md
└── index.json           # 索引
```

### 5. 团队共享标准
**Team-shared standards**

版本化的规范，作为团队级基础设施。

- 统一的代码规范
- 共享的设计原则
- 一致的开发流程

### 6. 跨平台复用
**Cross-platform reuse**

跨多个 AI 编码工具的标准化工作流。

| 支持的平台 | 说明 |
|-----------|------|
| Claude Code | `.claude/` 配置 |
| Cursor | `.cursor/` 配置 |
| Gemini CLI | Gemini 特定配置 |
| OpenCode | OpenCode 配置 |
| Codex | Codex 配置 |

---

## 快速开始

### 安装 Trellis

```bash
npm install -g @mindfoldhq/trellis@latest
```

### 在仓库中初始化

```bash
# 基本初始化
trellis init -u your-name
```

### 为特定平台初始化

```bash
trellis init --cursor --opencode --codex -u your-name
```

---

## 架构

所有核心工作流都位于 `.trellis/` 目录中：

```
.trellis/
├── spec/                  # 项目规范和指南
│   ├── coding-standards.md
│   ├── commit-rules.md
│   └── architecture.md
├── tasks/                 # 任务 PRD 和状态
│   ├── task-001.md
│   ├── task-002.md
│   └── status.json
├── workspace/             # 个人日志
│   ├── 2024-01/
│   └── 2024-02/
├── workflow.md            # 共享工作流规则
└── scripts/               # 自动化脚本
```

### spec/ 目录
项目规范和指南，包括：
- 编码标准
- 提交规则
- 架构决策

### tasks/ 目录
任务管理，包括：
- 任务 PRD 文档
- 任务状态跟踪
- 进度管理

### workspace/ 目录
个人工作日志，包括：
- 会话记录
- 每日工作摘要
- 学习和改进要点

---

## 使用场景

### 1. 标准化 AI Agent 项目工作流

使用 Trellis 可以为项目建立统一的 AI 开发规范：
- 代码规范自动注入
- 提交规则自动执行
- 架构约束自动验证

### 2. 并行运行多个 AI 开发任务

```
# 使用 Trellis 并行执行任务
trellis run task-001 --parallel
trellis run task-002 --parallel
trellis run task-003 --parallel
```

- 每个任务独立 worktree
- 无分支冲突
- 结果自动聚合

### 3. 跨会话保留项目上下文

```
# Trellis 自动保存上下文
每次会话结束 → 自动保存到 .trellis/workspace/
下次会话开始 → 自动加载历史上下文
```

### 4. 跨多个 AI 工具使用一致工作流

```
Claude Code → Trellis → 项目规范
Cursor     → Trellis → 项目规范
Gemini CLI → Trellis → 项目规范
```

---

## Trellis 与 CLAUDE.md 的关系

Trellis 补充了 CLAUDE.md/AGENTS.md 的功能：

| 特性 | CLAUDE.md | Trellis |
|------|-----------|---------|
| 项目规范 | ✅ | ✅ |
| 分层 Spec | ❌ | ✅ |
| 任务上下文 | ❌ | ✅ |
| Workspace 记忆 | ❌ | ✅ |
| 平台接入 | ❌ | ✅ |
| 多任务并行 | ❌ | ✅ |

> **"Trellis 补上了 CLAUDE.md/AGENTS.md 之外的结构：分层 Spec、任务上下文、workspace 记忆，以及按平台接入的工作流。"**

---

## 最新更新 (Version 0.3.6)

- **任务生命周期钩子**：支持任务开始、执行、完成等阶段的自定义钩子
- **自定义模板注册表**：支持自定义模板，扩展工作流
- **修复兼容性**：修复了新版 Claude Code 的 PreToolUse 钩子兼容性

---

## 工作流示例

### 创建新任务

```bash
# 创建任务
trellis task create "实现用户认证模块"

# 任务自动添加到 .trellis/tasks/
```

### 执行任务

```bash
# 执行任务（自动创建 worktree）
trellis task run task-001
```

### 任务状态跟踪

```bash
# 查看所有任务状态
trellis task status

# 输出
# task-001: ✅ 完成
# task-002: 🔄 进行中
# task-003: ⏳ 待处理
```

---

## 参考资源

- [Trellis - GitHub](https://github.com/mindfold-ai/Trellis) - 官方项目仓库
- [第15章：Claude Code Workflow](./chapter-15-claude-workflow.md)
- [第4.3章：Agent Skills（智能体技能）入门](../part-2/chapter-4-3-agent-skills.md)
