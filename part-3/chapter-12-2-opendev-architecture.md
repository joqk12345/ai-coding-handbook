---
id: "part-3-chapter-12-2-opendev-architecture"
title: "12.2: OpenDev 架构总览：分层体系、智能体核心与运行时机制"
slug: "part-3-chapter-12-2-opendev-architecture"
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
display_order: 78
---
# 12.2: OpenDev 架构总览：分层体系、智能体核心与运行时机制

如果把 OpenDev 看成一个面向软件工程的终端原生智能体系统，那么它的整体执行链路可以被拆成四个主要层次：入口与 UI 层、Agent 层、工具与上下文层，以及持久化层。一次用户请求会按顺序穿过这四层：先从入口进入，再进入智能体推理与工具执行，最后把状态与结果写入持久化系统，并返回给前端展示。

## OpenDev 的四层总体架构

### 入口与 UI 层

最外层是 CLI 入口。它负责解析命令行参数，并在启动时初始化四个共享管理器：`ConfigManager`、`SessionManager`、`ModeManager` 与 `ApprovalManager`。这些管理器随后会被注入到整个下游执行链路中，因此它们实际上构成了 OpenDev 的运行时基础设施。

OpenDev 同时支持两套前端：

- TUI：基于 Textual，采用阻塞式 modal approval。
- Web UI：基于 FastAPI 与 WebSocket，采用异步轮询审批。

虽然表现形式不同，但两套前端都遵守同一个 `UICallback` 协议，因此 Agent 层不需要感知自己是在终端里运行，还是在浏览器里运行。这种抽象使 UI 与推理核心保持解耦。

### Agent 层

Agent 层是系统的决策核心。OpenDev 将五类不同职责映射到五个不同的模型角色，并按需延迟初始化，每个模型都参考本地缓存的 capability registry 来决定可用能力。系统对外表现为两种工作方式：

- 正常模式（Normal Mode）：拥有完整的读写工具权限，用于实际执行。
- 规划模式（Plan Mode）：只暴露只读工具，用于安全地分析与规划。

单轮执行并不是简单的一次“问模型拿答案”，而是一个扩展版 ReAct 循环。每一轮大致经历四个阶段：

1. 当 token 预算接近耗尽时，自动做上下文压缩。
2. 可选的 thinking 阶段，用于在行动前做预推理。
3. 可选的 self-critique 阶段，用于自我审查。
4. 标准的 Reason-Act-Execute-Observe 阶段。

也就是说，OpenDev 的 Agent 层并不是一个“直接调用 LLM”的薄封装，而是一个围绕推理、约束与恢复机制构建出来的调度核心。

### 工具与上下文层

工具执行层的中心是 `ToolRegistry`。它负责把模型发起的 tool call 分发到类型化 handler 上，覆盖文件操作、进程执行、Web 访问等能力，同时支持批量并行执行和按需 MCP 工具发现。除此之外，OpenDev 还有一套 Skills 机制，会从内建、项目、本地用户三层目录中惰性注入可复用的 prompt 模板，以便在不扩大主 prompt 的前提下增强特定领域能力。

在工具层之上，是上下文工程层。它主要通过四个子系统来管理上下文窗口：

- `System Reminders`：根据上下文动态注入行为约束。
- `Prompt Composer`：以模块化方式拼接系统提示词。
- `Memory`：提供跨会话连续性。
- `Compaction`：在上下文逼近上限时回收 token 预算。

### 持久化层

OpenDev 会把状态分散保存到四类存储中：

- `Config Manager`：按“项目本地 → 用户全局 → 环境变量 → 内建默认值”的优先级解析配置。
- `Session Manager`：以 JSON 形式持久化完整对话历史。
- `Provider Cache`：在本地缓存模型能力元数据。
- `Operation Log`：记录文件变更，供回滚使用。

这使 OpenDev 不是一次性运行的临时助手，而是一个具有可恢复性、可持续会话能力的长期运行系统。

## 五层纵深防御的安全架构

由于 Agent 可以执行任意 shell 命令、覆盖文件、拉起常驻进程，因此单一安全机制并不足够。OpenDev 采用了五层相互独立的 defense-in-depth 设计，确保某一层失效时，其余层仍然能拦截危险行为。

### 第 1 层：Prompt 级护栏

这一层通过系统提示词约束模型行为，例如安全策略、动作安全、先读后改、Git 工作流、出错恢复等。它的目标是在模型“想做什么”这一层尽量减少危险倾向。

### 第 2 层：Schema 级工具限制

这里的核心思想是：不给模型看见它不该调用的工具。例如：

- Plan Mode 中只开放白名单工具。
- 不同 subagent 只拥有各自 `allowed_tools`。
- MCP 工具发现需要受控开启。

这意味着很多危险动作不会在“执行时被拒绝”，而是在“生成工具调用时就根本不会出现”。

### 第 3 层：运行时审批系统

OpenDev 支持手动、半自动、自动三种审批等级，并进一步支持按 pattern、command、prefix 和 danger rule 定义持久化权限。也就是说，系统不只知道“这个命令危险不危险”，还知道“当前用户是否已经允许它在这个上下文中运行”。

### 第 4 层：工具级校验

真正执行工具前，系统还会做一轮低层防护，包括：

- `DANGEROUS_PATTERNS` 阻断。
- stale-read detection。
- 输出截断。
- 超时控制。

这层防护不依赖模型是否理解了安全规则，而是在工具实现层做硬拦截。

### 第 5 层：生命周期 Hooks

在最靠近执行边界的位置，OpenDev 允许用户或团队通过 Hook 脚本介入。例如：

- 在 `PreToolUse` 中直接阻断操作（退出码 `2`）。
- 修改工具参数。
- 通过 JSON stdin 协议传递上下文。

这一层相当于把安全与治理能力开放给外部策略系统。

## 智能体核心层（Agent Core）

在 OpenDev 中，Agent 层位于 UI 与工具执行层之间。它的单一入口是 `MainAgent`，每一条用户消息都会先到这里，再由它决定是直接执行、先规划，还是委托给某个 subagent。理解这一层，需要从两个视角看：

- 脚手架（scaffolding）：第一条用户消息到来之前，系统如何把 agent 装配完成。
- 运行框架（harness）：装配完成后，系统如何在运行时调度工具、压缩上下文、执行安全策略并持久化状态。

简化地说，scaffolding 解决“agent 是怎么被造出来的”，harness 解决“agent 造好之后怎么长期稳定地跑”。

## Agent 脚手架：系统如何在启动前把智能体组装完成

### 类型基础：`BaseAgent` 与 `AgentInterface`

所有 agent 都继承自抽象基类 `BaseAgent`。它接收三个构造参数：`config`、`tool_registry` 与 `mode_manager`，并定义四个抽象方法：

- `build_system_prompt()`
- `build_tool_schemas()`
- `call_llm()`
- `run_sync()`

关键设计点在于 eager construction。`BaseAgent.__init__()` 会在构造阶段就调用 `build_system_prompt()` 和 `build_tool_schemas()`，因此一个 agent 在构造结束时就已经是“可工作的完整体”，而不是等第一次调用时才懒加载 prompt。这样做有两个直接好处：一是消除首轮调用的额外延迟；二是避免 MCP 动态发现后出现 schema 与 prompt 不一致的竞态。

下游代码并不直接依赖 `BaseAgent`，而是依赖一个 `@runtime_checkable` 的 `AgentInterface` 协议。只要对象具备 `system_prompt`、`tool_schemas`、`refresh_tools`、`call_llm` 与 `run_sync` 这些表面能力，就可以被工厂与调度层一致对待。

### 单一具体类：`MainAgent`

OpenDev 没有为不同 agent 角色建立复杂的类继承树。系统里唯一的具体 agent 类就是 `MainAgent`。主智能体、内建 subagent、用户自定义 agent，本质上都是这个类的实例。行为差异不来自类，而来自构造参数：

- `allowed_tools`：限制可见工具集合。
- `_subagent_system_prompt`：覆写系统提示词。
- `is_subagent`：根据是否配置工具过滤推导。

在初始化过程中，`MainAgent` 还会为 normal、thinking、critique 与 VLM 准备惰性初始化的 HTTP client 槽位；创建 `ToolSchemaBuilder`；并建立一个 `Queue(maxsize=10)` 供 Web UI 线程安全地注入消息。

### 工厂装配：`AgentFactory`

所有 agent 的构建都经过 `AgentFactory.create_agents()`。不论是 TUI 还是 Web UI，都会经过同一条装配流水线，因此系统前端不同，但 agent 初始化路径完全一致。工厂会按严格顺序执行三个阶段：

1. Skills：扫描内建、用户全局与项目本地三类 skills 目录，创建 `SkillLoader`，并注册到工具层。
2. Subagents：创建 `SubAgentManager`，注册默认 subagent，再加载用户自定义 agent。
3. Main agent：最后创建拥有完整工具访问权限的 `MainAgent`。

这个顺序不能打乱，因为 `spawn_subagent` 工具的 schema 是动态构造的，只有 subagent 都注册完之后，主 agent 才能得到完整的工具描述。

### Subagent 编译过程

每个 subagent 最初只是一个 `SubAgentSpec`，里面描述名字、说明、系统提示词、工具白名单、模型覆写以及可选的 Docker 配置。当 `SubAgentManager.register_subagent(spec)` 被调用时，会经历四步：

1. 解析工具列表，如果没有显式指定，就回退到一组默认安全工具。
2. 如果有模型覆写，则复制一份 `AppConfig`。
3. 构造一个带 `allowed_tools` 的 `MainAgent`，触发过滤后的 prompt 与 schema 的 eager build。
4. 将 `_subagent_system_prompt` 设置为该 subagent 的覆写提示词。

最终存储的不是“定义”，而是一个已编译完成的 `CompiledSubAgent`。它运行时与主 agent 共用同一个工具注册表，但通过 schema 过滤和独立上下文实现真正隔离。

### 依赖注入

构造出 agent 还不够，运行时还需要把一组管理服务传进去。OpenDev 使用 `AgentDependencies` 作为运行时依赖容器，其中包含：

- `mode_manager`
- `approval_manager`
- `undo_manager`
- `session_manager`
- `working_dir`
- `console`
- `config`

主 agent 在 `run_sync()` 时接收这一整组依赖；subagent 则只拿到一个裁剪版 `SubAgentDeps`，其中仅保留 `mode_manager`、`approval_manager` 与 `undo_manager`。这种差异本身就是隔离边界的一部分。

### 架构演化

当前脚手架架构不是一步到位形成的，而是经历了三次重要转向：

- 用单一参数化 `MainAgent` 替代早期多层继承树，避免能力混合时的菱形继承问题。
- 用 eager build 替代 lazy prompt build，消除首轮延迟与 MCP 工具不一致问题。
- 用 `SubAgentSpec` 编译体系替代内联硬编码 subagent，实现内建 agent 与用户自定义 agent 的统一注册路径。

## Agent 运行时架构：Harness 如何让一个静态 LLM 变成长期运行的系统

脚手架完成后，进入运行期。OpenDev 的 harness 就是包裹在核心推理循环外的一层编排基础设施，它负责工具调度、上下文管理、安全约束与会话持久化。

### 中央执行周期

一次完整的执行迭代通常包含六个阶段：

1. 预检查与上下文压缩。
2. thinking。
3. self-critique。
4. action。
5. tool execution。
6. post-processing。

循环会一直持续，直到 agent 返回最终文本且不再调用工具，或者触发安全上限。

### 输入与输出边界

在输入侧，OpenDev 用一个线程安全的有界队列接收用户消息，因此 agent 运行中也可以接收补充指令。运行配置，例如模型选择、审批等级、工作目录，也会沿同一路径进入执行上下文。

在输出侧，post-processing 负责三件事：

- 保存更新后的对话到 session store。
- 执行已注册的 Stop hooks。
- 将最终响应返回到 UI 层渲染。

### 七个外围子系统

围绕中央 ReAct 循环，OpenDev 还布置了七个支撑子系统：

- Prompt Composition：按优先级拼接系统提示词模块。
- Tool Registry：统一分发工具调用，并支持 MCP 惰性发现。
- Safety System：提供多层独立防护。
- Context Engineering：把对话当作有限资源管理。
- Memory & Session：保存对话与策略记忆。
- Subagent Orchestration：支持把任务委托给隔离 subagent。
- Message Injection：允许执行中接收新的用户输入。

这些子系统共同决定了 OpenDev 不是“一次调用”的代理，而是一个长期、自恢复、可扩展的运行时。

## Plan Mode 与 Normal Mode：先规划还是直接执行

OpenDev 把用户请求分成两类：

- 需要先分析与规划的请求。
- 可以直接执行的请求。

当检测到 `/plan` 命令，或用户请求包含 “design”“architect”“plan” 之类的意图时，系统会优先进入规划路径。其余请求则默认走正常执行路径。

### Plan Mode：基于 subagent 的安全规划

OpenDev 没有把主 agent 切换到一个特殊的“只读状态机”里，而是把规划任务委托给一个专门的 Planner subagent。主 agent 通过 `spawn_subagent(type="Planner")` 拉起规划子智能体，而这个子智能体只拥有只读工具，根本看不到写入工具 schema，因此在机制上就不可能做修改操作。

Planner 的工作流程可以概括为三步：

1. 用只读工具探索代码库。
2. 分析发现、识别风险并制定步骤。
3. 把计划写入 scratch 目录下的 plan 文件。

这个 plan 通常包含七个部分：目标、上下文、待修改文件、待创建文件、实现步骤、验证标准与风险。

计划生成后，主 agent 通过 `present_plan(plan_file_path)` 把计划呈现给用户，用户可以选择 revise 或 approve。批准后，系统再进入执行阶段。

### Normal Mode：完整执行

正常模式下，agent 拥有全部工具，包括读写文件、执行命令、编辑代码与生成 subagent。执行过程中，如果计划与现实发生偏差，例如测试失败暴露了更深层问题，主 agent 还可以再次拉起 Planner subagent，基于最新上下文做重规划。

### 为什么选择 subagent 式规划

早期设计是一个四工具状态机：`enter_plan_mode`、`exit_plan_mode`、`create_plan`、`edit_plan`。问题在于，一旦主 agent 没有正确退出规划状态，系统就会卡在只读模式。当前方案通过“单独拉起一个只读 Planner”彻底消除了这个状态机。这样做有三个好处：

1. 不会卡在 plan mode。
2. Planner 可以和别的 subagent 并行运行。
3. 暴露给模型的规划工具从四个缩减为一个，显著降低认知负担。

## 会话生命周期：一条用户消息如何穿过系统

一次对话轮次从输入到持久化，大致会经过以下路径。

### 输入接入

用户输入可以来自三种入口：

- 非交互式 CLI 单次调用。
- TUI 交互式 REPL。
- Web UI 的 WebSocket 消息。

三条路径最终汇聚到同一个 agent 执行核心。TUI 路径会在进入 ReAct 循环前多做一层预处理，例如保存会话、触发生命周期 hook、展开 `@file` 引用、整理成 LLM API 期望的 message list。

### 迭代循环

每次迭代通常按固定顺序执行：

1. 清空 UI 线程注入的消息队列。
2. 检查上下文压力并做 compaction。
3. 如果启用了 thinking，则先调用无工具 thinking model。
4. 调用 action model，获得文本、tool calls 或两者兼有的响应。
5. 如果有 tool calls，则通过 tool registry 调度执行；只读工具可并行，写工具顺序执行。

如果其中某个 tool call 会委托给 subagent，那么 subagent 会在隔离上下文中完成工作，再把摘要返回给主 agent。

### 终止与持久化

循环的结束通常有四种路径：

- agent 返回纯文本且没有工具调用。
- agent 显式调用完成工具。
- 错误恢复预算耗尽。
- 迭代次数达到安全上限。

在真正结束前，系统还会检查是否还有未完成任务项，或注入队列里是否还有新消息。如果有，就不会立刻收尾。只有在这些条件都满足时，最终会话状态才会被持久化。

### 生命周期 Hooks

OpenDev 暴露了一整套生命周期事件，供外部脚本观察或拦截，例如：

- `SessionStart`
- `UserPromptSubmit`
- `PreToolUse`
- `PostToolUse`
- `PostToolUseFailure`
- `SubagentStart`
- `SubagentStop`
- `Stop`
- `PreCompact`
- `SessionEnd`

阻塞型 hook 可以通过退出码 `2` 直接拦截操作，也可以通过 stdout 返回 JSON 来修改工具参数。全局 hook 与项目 hook 还可以按事件类型合并，为团队级治理提供落点。

## REPL 命令分发：不是所有输入都需要进入 Agent Loop

OpenDev 在输入边界实现了双路径分发：

- 以 `/` 开头的输入，进入命令处理器。
- 普通自然语言输入，进入 query processor，再进入 agent loop。

这个设计的意义在于，把系统级控制操作和开放式推理解耦。像 session 管理、模型切换、MCP server 配置之类的操作，本质上是确定性的，不需要浪费一次 LLM 推理。

### 命令处理器抽象

所有命令 handler 都继承自同一个抽象基类，并共享统一的输出格式。每个 handler 在构造时拿到 REPL 实例，因此可以访问 session、mode、config、MCP 等共享管理器。命令执行后统一返回 `CommandResult`，其中包含成功标记、人类可读消息以及可选结构化数据。

### 命令类别

OpenDev 用九类 handler 覆盖整个交互式控制面，包括：

- session 命令：如 `/clear`、`/compact`
- mode 命令：如 `/mode`
- configuration 命令：如 `/models`
- MCP 命令：如 `/mcp connect`
- agent 命令
- skills 命令
- plugin 命令
- tool 初始化命令：如 `/init`
- help 命令

### 为什么命令与工具要分离

REPL 命令与 agent 工具在架构上是两类完全不同的东西。命令由用户显式触发，REPL 同步执行，不走 LLM，也不经过 tool hooks、approval gate 或 undo tracking。工具则是由模型在推理中选出来的，必须经过注册表、审批系统、执行前后 hook 和撤销管理。这种分离让系统级操作保持快速、可预测，而把开放式问题求解留给 agent loop。

## 面向工作负载优化的多模型架构

复合 AI 系统的一个关键判断是：不同任务适合不同模型。复杂推理需要更长思考，视觉任务需要 VLM，总结压缩则更适合更便宜、更快的模型。如果所有任务都强行交给同一个模型，要么成本过高，要么质量不足。

OpenDev 因此定义了五类模型角色：

- `action model`：默认执行模型，负责工具推理。
- `thinking model`：在无工具环境下做扩展思考。
- `critique model`：做自我评审。
- `vision model`：处理截图、图像等视觉输入。
- `compact model`：负责上下文压缩与总结。

每一类模型都有回退链。例如 critique model 不可用时，可以回退到 thinking model，再回退到 action model。所有 provider client 都按需惰性初始化，从而减少启动时延；模型能力元数据则使用本地 TTL 缓存，以换取离线可启动性与后台刷新能力。

## 扩展 ReAct 执行循环

OpenDev 的执行核心是 `ReactExecutor`，它实现的不是标准版 ReAct，而是一个扩展版的 ReAct 循环。标准 ReAct 把推理与行动揉在同一轮中，容易导致模型过早调用工具；OpenDev 则把“思考”和“行动”拆开。

### 初始化

当用户请求进入 executor 后，系统会：

1. 清空待处理的注入队列。
2. 创建 interrupt token。
3. 把消息历史包装进 `ValidatedMessageList`。
4. 组装一个 `IterationContext` 保存本轮执行状态。

### Phase 0：分阶段上下文管理

每次迭代开始时，系统都会评估 token 占用比例，并按五个阈值逐步采取更激进的压缩策略：

- 70%：告警。
- 80%：mask 旧 observation。
- 85%：快速 pruning。
- 90%：更激进的 masking。
- 99%：触发完整的 LLM compaction。

这种 staged compaction 的目标是尽量先用便宜的手段回收上下文，而不是一上来就做昂贵的整段总结。

### Phase 1：Thinking

如果开启 thinking mode，系统会先调用一个无工具的 thinking model，让它只做分析、不做动作。这样可以减少模型看到工具之后“急着行动”的倾向。thinking 深度通常分为 `OFF`、`LOW`、`MEDIUM`、`HIGH` 四档，其中 `HIGH` 会自动包含 self-critique：先产出 reasoning trace，再由 critique model 对这份 trace 进行评审，然后重新修正。

最终得到的 thinking trace 会作为系统提醒重新注入到对话中，供 action model 在下一阶段参考。

### Phase 2：Action

接着，executor 会组装完整 action prompt，包括：

- 由 `PromptComposer` 拼接出的系统提示词。
- memory playbook 中选出的经验条目。
- 全部可见工具 schema。
- 含 thinking trace 的会话历史。

然后将这份 prompt 发送给 action model。返回结果中可能包含文本、tool calls，或两者兼有。

### Phase 3：决策、调度与 doom-loop detection

如果 action model 没有返回 tool calls，系统会根据上下文决定是结束、继续，还是注入错误恢复提示。若有 tool calls，则会先执行 doom-loop detection。

其做法是：把每个工具调用的 `tool name + args` 组合成 MD5 指纹，维护一个最近 20 次调用的滑动窗口。一旦某个指纹出现 3 次及以上，系统就会先插入警告消息；如果模型继续重复，则升级为 approval-based pause，由用户选择继续还是中断。

这比简单按“工具调用次数过多”来判断更有效，因为它能精确识别“同一个动作被原样重复”。

当没有检测到 doom loop 时，系统再决定并行或串行执行工具，并将结果写回会话，进入下一轮迭代。

### 终止条件

执行循环的终止通常由四类条件触发：

- 显式完成工具被调用。
- 返回了没有 tool call 的纯文本响应。
- 连续错误恢复超过预算。
- 达到最大迭代次数。

如果还有未完成任务项，系统会继续 nudging，而不是轻易接受“任务已完成”的表述。

## Subagent 编排：把复杂任务拆给隔离的专用智能体

OpenDev 的主 agent 可以为特定子任务拉起专门的 subagent，例如：

- 代码探索器：只读工具，专注理解代码库。
- 战略规划器：只读工具 + 更深推理，负责制定方案。
- Web 工具型 subagent：抓取 Web 内容并落盘。
- 用户澄清型 subagent：用最小工具集收集补充信息。

### 为什么要限制 subagent 工具集合

工具过滤并不是保守，而是为了提高系统质量：

1. 避免 task 管理工具在多个 agent 之间竞争，造成状态冲突。
2. 减少子智能体看到的 schema 规模，使它更专注。
3. 限制错误爆炸半径，例如代码探索器不能意外改文件。

### 并行执行

当主 agent 在同一轮里发出多个 `spawn_subagent` 调用时，系统会自动并行执行这些子任务，例如并行搜索文件、并行探索代码库或并行抓取外部页面。这样做牺牲了一些线程管理复杂度，但可以显著降低独立任务的总延迟。

### Prompt 微调与演化

早期 subagent prompt 缺少明确 stop condition，导致代码探索器会在同一批文件之间反复来回。后来系统加入了停止条件、反循环提示，以及“在证据已经足够时立即停止”的规则，显著改善了探索质量。类似地，Planner subagent 也被要求在完成摘要中显式返回 `plan_file_path`，以便主 agent 可以直接把它交给 `present_plan`。

## 小结

从架构上看，OpenDev 的核心价值不在于“把一个大模型接进终端”，而在于它如何把一个静态模型包装成一个长期运行、具备安全边界、上下文管理、子智能体编排与多模型分工能力的工程系统。脚手架负责把 agent 构造成一个完整可用的对象，运行框架负责保证它在真实开发环境中稳定工作，而上下文工程与多层安全机制则共同决定了这个系统能否真正走向生产级使用。
