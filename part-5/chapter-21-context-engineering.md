# 第23章：上下文工程的文件系统抽象 —— AIGNE 框架与可验证的 GenAI 系统

> *"一切皆文件"——将 Unix 哲学引入 GenAI 上下文管理。*

## 引言：上下文工程的崛起

**上下文工程（Context Engineering）** 正在成为 GenAI 和 Agentic 系统软件架构的核心关注点。它指的是捕获、组织和管理外部知识、记忆、工具和人类输入的过程，以便大型语言模型（LLM）和 Agent 的推理建立在正确的信息、约束和来源之上。

与专注于制作单个指令的**提示工程**不同，上下文工程关注整个信息生命周期：从选择、检索、过滤、构建，到压缩、评估和刷新——确保 GenAI 系统和 Agent 保持连贯、高效和可验证。

### 当前挑战

当前的实践，如提示工程、检索增强生成（RAG）和工具集成，仍然是**碎片化的**，产生短暂的工件，限制了可追溯性和问责制。这导致了**上下文腐化（Context Rot）** 和知识漂移的挑战。

本文提出了一种**文件系统抽象**作为上下文工程的架构基础，灵感来自 Unix 的**"一切皆文件"**理念。

---

## LLM-as-OS 范式

### 从操作系统视角看 LLM

Agentic Generative AI 系统的兴起催生了 **LLM-as-OS（LLM 即操作系统）** 范式，将 LLM 概念化为一个内核，协调上下文、记忆、工具和 Agent。

相关项目包括：

| 项目 | 描述 |
|------|------|
| **AIOS** | 通过类 OS 原语实现调度、资源分配和多 Agent 系统的内存管理 |
| **MemGPT** | 引入内存层次结构，协调短期（上下文窗口）和长期（外部存储）内存 |
| **LLM 语义文件系统** | 实现自然语言驱动的文件操作和语义索引 |

虽然 LLM-as-OS 范式提供了一个直观的高级概念模型，但它**缺乏软件架构抽象**来确保上下文如何被结构化、共享和管理。

---

## 文件系统作为上下文基础设施

### 核心架构

文件系统提供了使 GenAI 系统中的系统化上下文工程成为可能的基础设施。在这个环境中，Agent 和人类专家类似于操作系统进程，在挂载的上下文资源上执行文件式操作（读取、写入、搜索）。

```
┌─────────────────────────────────────────────────────────────────┐
│                    文件系统抽象层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Memory    │  │   Tools     │  │   Knowledge │             │
│  │  (记忆)     │  │   (工具)     │  │   (知识)     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│              ┌─────────────────────┐                            │
│              │   Agent / Human     │                            │
│              │   (OS 进程)         │                            │
│              └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### 五大软件工程原则

#### 1. 抽象（Abstraction）

文件系统实现了抽象的 SE 原则，提供了一个统一接口，隐藏了底层上下文源的异构性。无论资源是知识图谱、内存存储还是人工策划的笔记，都通过标准化的文件接口表示。

这使得 Agent 可以在不知道其物理格式、存储机制或检索逻辑的情况下，对不同上下文类型进行推理。

#### 2. 模块化与封装（Modularity and Encapsulation）

架构通过将环境分解为独立管理的上下文资源来实现模块化。每个资源都被封装为具有明确定义边界和元数据的挂载组件。这种封装隔离了每个资源的内部逻辑或后端实现，同时仅暴露集成所需的最小操作集。

#### 3. 关注点分离（Separation of Concerns）

文件系统区分数据、工具和治理层。非可执行文件（如 config.yaml）作为数据或知识资源，而可执行工件（如 analyser.py）代表活动工具。关注点分离还扩展到治理：访问控制、日志和元数据管理通过专用机制处理，与检索或推理的功能逻辑无关。

#### 4. 可追溯性与可验证性（Traceability and Verifiability）

与文件系统的每次交互（无论是 Agent 还是人类发起）都作为事务记录在持久化上下文仓库中。这强制执行可追溯性，能够重建上下文来源和操作问责。结构化元数据支持审计，允许回顾性检查更改、推理步骤和工具调用。

#### 5. 可组合性与可演化性（Composability and Evolvability）

文件系统通过在所有挂载资源上定义一致的命名空间和互操作元数据模式来实现可组合性。上下文元素可以组合、查询或集成到更高级的推理过程中，无需额外的集成代码。

---

## 持久化上下文仓库：历史与内存生命周期

### 大模型的固有问题

LLM 本质上是**无状态的**：一旦会话结束，所有上下文信息都会丢失。为了在会话之间保持连贯推理，GenAI 系统需要一个外部持久化内存仓库来捕获、组织和演化上下文。

### 生命周期设计

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   History   │───▶│   Memory    │───▶│  Scratchpad │
│   (历史)    │    │   (记忆)    │    │  (草稿板)   │
└─────────────┘    └─────────────┘    └─────────────┘
      ▲                                       │
      └───────────────────────────────────────┘
```

当交互发生时：
1. **原始数据**首先追加到 History
2. **摘要、嵌入和索引**将这些记录转换为 Memory 表示
3. 在推理过程中，临时信息被写入 **Scratchpad**
4. 验证后，可选择将内容插入 Memory 或存档到 History

### 三种上下文类型

| 类型 | 持久性 | 描述 |
|------|--------|------|
| **History** | 全局永久 | 所有原始交互的不可变记录 |
| **Memory** | Agent 特定 | 可持久但可变的记忆 |
| **Scratchpad** | 临时 | 特定任务或推理情节的范围 |

### 记忆类型分类

| 记忆类型 | 时间范围 | 结构单元 | 表示方式 |
|---------|----------|----------|----------|
| Scratchpad | 临时 | 对话轮次 | 纯文本或嵌入 |
| Episodic Memory | 中期 | 会话摘要 | 摘要文本或嵌入 |
| Fact Memory | 长期 | 原子事实语句 | 键值对或三元组 |
| Experiential Memory | 长期 | 观察-行为轨迹 | 结构化日志 |
| Procedural Memory | 长期 | 函数/工具定义 | API 或代码引用 |
| User Memory | 长期 | 用户偏好 | 用户画像 |
| Historical Record | 不可变 | 完整追踪 | 带元数据的纯文本 |

---

## 上下文工程管道

### 设计约束

GenAI 模型引入了一组独特的架构设计约束，定义了上下文工程管道设计的基本原理：

#### 1. Token 窗口

Token 窗口定义了模型在单次推理过程中可以关注的**最大 Token 数量**。这是硬性架构约束：
- GPT-5: 128K
- Claude Sonnet 4.5: 200K

随着输入提示长度增加，GenAI 模型的计算成本因自注意力机制的二次复杂性而显著上升。

#### 2. 无状态性

GenAI 模型本质上是**无状态的**，不会跨会话保留对话历史或记忆。这需要外部持久化上下文仓库来记录、重建和管理跨交互的相关信息。

#### 3. 非确定性输出

由于 LLM 根据采样参数（如 temperature）生成概率输出，**相同的提示可能产生不同的响应**。这给可追溯性、测试和验证带来了挑战。

### 管道组件

```
┌─────────────────────────────────────────────────────────────────┐
│                    上下文工程管道                                │
│                                                                 │
│  ┌─────────────────┐                                           │
│  │ Context         │  1. 从持久化仓库选择相关上下文             │
│  │ Constructor     │  2. 优先排序和压缩                         │
│  │ (上下文构造器)  │  3. 生成上下文清单                         │
│  └────────┬────────┘                                           │
│           ▼                                                    │
│  ┌─────────────────┐                                           │
│  │ Context         │  1. 同步 token 窗口与持久化仓库            │
│  │ Updater         │  2. 增量流式传输                           │
│  │ (上下文更新器)  │  3. 自适应刷新                             │
│  └────────┬────────┘                                           │
│           ▼                                                    │
│  ┌─────────────────┐                                           │
│  │ Context         │  1. 验证模型输出                          │
│  │ Evaluator       │  2. 更新持久化仓库                        │
│  │ (上下文评估器)  │  3. 触发人工审查                           │
│  └─────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

#### Context Constructor（上下文构造器）

Constructor 定义了如何从持久化上下文仓库中选择、优先排序和压缩相关上下文，以准备适合模型活动上下文窗口的有界、特定任务的输入。

关键功能：
- 管理完整性（覆盖所有相关信息）与有界性（尊重 Token 约束和成本效率）之间的权衡
- 通过摘要、嵌入或聚类技术压缩所选上下文
- 生成上下文清单，记录选择和排除的元素

#### Context Updater（上下文更新器）

Updater 管理将构造的上下文转移到 GenAI 模型的有界推理空间。给定模型的有限 Token 窗口，Updater 必须持续同步 Token 窗口、持久化上下文仓库的状态和运行时对话。

三种模式：
1. **静态快照**：单次推理任务前注入
2. **增量流式传输**：推理展开时逐步加载额外上下文片段
3. **自适应刷新**：响应模型反馈或人工干预替换过时片段

#### Context Evaluator（上下文评估器）

Evaluator 通过验证模型输出、更新持久化上下文仓库和维护 evolving 知识库的治理来闭合循环。

关键功能：
- 检测幻觉、矛盾或上下文漂移
- 将验证输出转换为结构化记忆元素
- 当置信度阈值低或检测到矛盾时触发人工审查

---

## AIGNE 框架实现

### 框架概述

AIGNE 框架实现了所提出的文件系统和上下文工程管道。AIGNE 提供与多个主流大语言模型（OpenAI、Gemini、Claude、DeepSeek、Ollama）的原生集成，并通过内置的 Model Context Protocol (MCP) 实现与外部服务的动态和上下文感知应用行为。

### AFS（Agentic File System）模块

AFS 模块是主要的文件系统接口，提供以下关键功能：

- 支持 list、read、write、search 命令管理挂载目录中的文件
- 支持跨嵌套子目录导航
- 集成 ripgrep 实现高效内容搜索
- 访问文件时间戳、大小、类型，支持用户定义的元数据
- 沙盒访问限制在挂载目录，确保隔离和安全文件操作

### 编程示例

#### 示例 1：带记忆的 Agent

```typescript
import { AIAgent } from "@aigne/core";
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";

const sharedStorage = { url: "file:./memory.sqlite3" };

const afs = new AFS()
  .mount(new AFSHistory({ storage: sharedStorage }))
  .mount(new UserProfileMemory({ storage: sharedStorage, context: aigne.newContext() }));

const agent = AIAgent.from({
  instructions: "You are a friendly chatbot",
  inputKey: "message",
  afs,
});
```

#### 示例 2：MCP 挂载 GitHub

```typescript
import { AIAgent } from "@aigne/core";
import { AFS } from "@aigne/afs";
import { MCPAgent } from "@aigne/core";

const mcpAgent = await MCPAgent.from({
  command: "docker",
  args: ["run", "-i", "--rm", "-e", `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`, "ghcr.io/github/github-mcp"],
});

const afs = new AFS().mount(mcpAgent); // 挂载到 /modules/github-mcp

const agent = AIAgent.from({
  instructions: "Help users interact with GitHub via the github-mcp-server module.",
  inputKey: "message",
  afs,
});
```

### MCP 工具调用

挂载后，Agent 可以使用 `afs_exec` 直接调用所有 GitHub MCP 工具：
- `/modules/github-mcp/search_repositories`
- `/modules/github-mcp/list_issues`

---

## 人类-AI 协作

### 人类的角色

随着 GenAI 成为教育、医疗和决策支持等领域的积极协作者，**人类越来越多地与 AI 共同进行推理和决策任务**。上下文工程架构确保：

1. **人类作为策展人**：策划和组织知识
2. **人类作为验证者**：审核和验证 AI 输出
3. **人类作为共同推理者**：参与推理过程

### 人工介入机制

当 Evaluator 检测到不确定性（置信度低于阈值或信息不一致）时，触发人工验证阶段。人工注释作为显式上下文元素存储，将隐性知识提升为知识库的一级组件。

---

## 未来方向

### Agentic 导航

未来扩展将探索 AFS 层次结构中的 Agentic 导航，使 Agent 能够自主浏览、构建索引和演化挂载空间中的数据结构。

### 活的知识结构

通过允许 Agent 作为自我组织进程，观察和修改自己的上下文，架构可以逐渐演化为活的知识结构，推理、记忆和行动在可验证和可扩展的文件系统基质中融合。

### 强化人类-AI 协作

另一个重要方向是强化人类-AI 协作，不仅让人类能够监督或纠正系统行为，还能作为上下文工程的积极参与者贡献、策划和语境化知识。

---

## 参考资源

- [AIGNE Framework - GitHub](https://github.com/aigne) - 开源 GenAI Agent 开发框架
- [MemGPT - LLM Operating Systems](https://memgpt.ai/) - 内存层次结构管理系统
- [AIOS - LLM as OS](https://github.com/agiresearch/AIOS) - LLM 操作系统范式
- [第21章：Harness Engineering](./chapter-20-harness-engineering.md)
- [第20章：在 Agent-First 的世界中充分发挥 Codex 的威力](./chapter-19-leveraging-codex.md)
- [第19章：自主代码库](./chapter-18-self-driving-codebase.md)
