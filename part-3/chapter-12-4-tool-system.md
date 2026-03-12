---
id: "part-3-chapter-12-4-tool-system"
title: "12.4: OpenDev 的工具系统：注册表架构、文件操作与可扩展能力"
slug: "part-3-chapter-12-4-tool-system"
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
display_order: 80
---
# 12.4: OpenDev 的工具系统：注册表架构、文件操作与可扩展能力

智能体与开发环境交互的全部能力，最终都要落在工具系统上。对 OpenDev 而言，工具层不是一组随意拼接的命令包装器，而是一个可扩展的能力生态：它一方面要覆盖足够全面的工程能力，另一方面又要兼顾上下文效率；既要保证安全，又不能牺牲灵活性；既要支持内建工具，也要容纳动态发现的外部工具。

完整的内建工具目录收录在附录中，本文重点讨论支撑这些工具的注册表架构，以及围绕它组织出来的几个主要类别：文件操作、Shell 执行、Web 交互、基于 LSP 的语义代码分析、用户交互与任务管理、通过 MCP 进行外部工具发现，以及 subagent 委派。贯穿所有类别的是一套纵深防御式安全机制。

## 12.4.1 注册表架构与 Schema 构建

随着能力增加，简单的“平铺工具命名空间”很快会变得不可维护。若所有工具都硬编码进一个全局 dispatch 分支里，可扩展性几乎为零；若允许无结构的动态插件加载，又会引入命名冲突、组织混乱和安全策略难以下沉的问题。OpenDev 的解决方案，是采用“注册表 + handler 分类”的方式，用 schema 化注册来组织工具能力。

### 三个彼此分离的关注点

OpenDev 把工具系统拆成三个清晰的职责域：

- `ToolSchemaBuilder`：只负责收集和构建工具 schema。
- `ToolRegistry`：只负责根据工具名做执行路由。
- `Lifecycle Hooks`：只负责在工具调用前后插入策略与扩展行为。

这种分离非常关键。它意味着“告诉模型有哪些工具”“真正把工具调起来执行”“在执行边界插入安全与审计逻辑”是三件不同的事，而不是写在同一个大函数里。

### ToolSchemaBuilder：从三类来源装配工具定义

`ToolSchemaBuilder` 会从三类来源拼装 JSON schema：

1. 静态内建 schema，即 `_BUILTIN_TOOL_SCHEMAS`，大约覆盖 40 个内建工具，描述文本通过 `load_tool_description()` 从 markdown 模板加载。
2. 动态发现的 MCP 工具 schema，但只包含 `_discovered_mcp_tools` 集合中的工具，以避免一上来就把全部外部工具塞进上下文。
3. subagent schema，当 `SubAgentManager` 存在时，会把 subagent 相关 schema 注入其中。

拼装好的 schema 会被注入到 LLM prompt 中，从而让模型“知道自己能做什么”。

### ToolRegistry：中央分发器

`ToolRegistry` 是工具执行的中央路由器。它把工具名映射到不同 handler 类的方法上。目前系统按类别划分成多个 handler，例如文件、进程、Web、符号分析、用户交互、任务管理、MCP 发现和 batch 执行等。每个 handler 都接收一份 `ToolExecutionContext`，其中打包了工具执行时会用到的横切服务：

- `mode_manager`
- `approval_manager`
- `undo_manager`
- `task_monitor`
- `session_manager`
- `ui_callback`
- `file_time_tracker`

此外，Registry 还会在真正 dispatch 之前先执行模式约束。例如在 plan mode 中，写入类工具会被直接拦下，并返回一条带说明的错误信息，而不是等 handler 执行后再发现越权。

### 生命周期 Hooks：在不改 handler 的前提下扩展系统

OpenDev 通过 lifecycle hooks 提供无侵入扩展能力。系统支持十个生命周期事件，覆盖从会话启动到结束的全链路，例如：

- `SESSION_START`
- `USER_PROMPT_SUBMIT`
- `PRE_TOOL_USE`
- `POST_TOOL_USE`
- `POST_TOOL_USE_FAILURE`
- `SUBAGENT_START`
- `SUBAGENT_STOP`
- `PRE_COMPACT`
- `SESSION_END`
- `STOP`

其中，`PreToolUse` 是同步阻塞型 hook。如果外部脚本返回退出码 `2`，该工具调用会被硬阻断，模型无论怎么 prompt engineering、用户如何设置 approval level，都无法绕过。Hook 还可以通过返回带 `updatedInput` 的 JSON 来修改工具参数，例如自动注入 `--dry-run`。而 `PostToolUse`、`PostToolUseFailure` 这类 hook 则异步执行，适合做审计和日志采集，不阻塞 agent 主流程。

所有外部 hook 脚本都能通过 stdin 接收完整事件上下文 JSON，例如会话 ID、工作目录、工具名、输入参数和执行结果。这让团队可以轻松实现项目特定策略，例如禁止写入受保护路径、强制命名规范、或者把工具审计流转发到外部系统。

### 运行时审批

在任何工具调用真正进入 handler 之前，OpenDev 还会经过运行时审批系统。默认有三种自治等级：

- `Manual`：每个工具调用都必须显式审批。
- `Semi-Auto`：对只读操作自动批准，对写入操作要求审批。
- `Auto`：全部自动放行，用于高信任工作流。

在默认等级之上，`ApprovalRulesManager` 还会按优先级顺序评估一套规则，规则类型包括：

- Pattern：基于完整命令字符串的正则。
- Command：精确匹配。
- Prefix：前缀匹配，例如 `git` 匹配 `git push`。
- Danger：带自动拒绝语义的危险正则。

系统内建一批永远生效的 danger rules，例如 `rm -rf /`、`rm -rf *`、`chmod 777` 之类，它们优先级固定且不可被用户配置覆盖。规则匹配按优先级顺序执行，第一条命中就决定该命令的动作：自动允许、自动拒绝、要求审批或要求用户先编辑命令。

这些规则会持久化到两个 JSON 存储：

- 用户全局：`~/.opendev/permissions.json`
- 项目本地：`.opendev/permissions.json`

若两者同时存在，项目本地规则优先，从而允许在某个仓库里收紧权限边界，即便用户全局配置更宽松。

审批流程还会根据当前前端变化：

- 在 TUI 中，使用阻塞式 `prompt_toolkit` 菜单。
- 在 Web UI 中，通过 WebSocket 发出 `approval_required` 事件，并在浏览器里展示审批对话框。

每一条审批决策都会被记录到 `CommandHistory` 中，便于后续审计。

### 架构演化

OpenDev 早期版本直接把工具注册在全局命名空间里，结果很快遇到两个问题：工具名冲突严重，且安全配置需要一个个工具单独处理。引入 category-based handler 之后，这两个问题同时得到缓解：一方面类别天然带来隐式命名空间，另一方面很多安全策略可以下沉到类别级别而不是单工具级别。

## 12.4.2 文件操作

文件系统工具是智能体改代码、读代码和搜索代码的核心通道。OpenDev 用五个工具覆盖绝大多数文件级工程任务：`read_file`、`write_file`、`edit_file`、`list_files` 和 `search`。

### read_file：带行号的文件读取

`read_file` 以类似 `cat -n` 的方式返回带行号内容，帮助 agent 在后续编辑时精确引用位置。它支持三个主要参数：

- `file_path`：必填。
- `offset`：1 基行号起点，默认 1。
- `max_lines`：默认 2000。

在返回前，handler 还会执行多种输出变换：

- 二进制检测：对非文本文件直接返回描述性错误，而不是把字节垃圾塞进上下文。
- 总输出截断：当内容超过 30000 字符时，采用 head-tail 截断，保留前 10000 和后 10000，中间插入截断标记。
- 单行截断：单行超过 2000 字符时也会被裁剪，防止 minified 文件或数据行吞噬上下文。
- stale-read 跟踪：`FileTimeTracker` 会记录每次成功读取的时间戳，并在后续编辑前验证文件是否已被外部修改。若修改时间晚于上次读取时间，编辑将被拒绝并要求 agent 先重读文件。

这一 stale-read 机制能有效阻止并发编辑场景下的静默覆盖。

### write_file：只负责创建，不负责覆盖

`write_file` 只能创建新文件，若目标文件已存在，则会直接拒绝并要求 agent 改用 `edit_file`。这个约束非常重要，因为让 agent 直接“整文件重写”是最容易出事故的路径之一。参数包括：

- `file_path`
- `content`
- `create_dirs`

成功执行后，工具会走审批流程，并把该写入记录给 undo manager，便于后续回滚。

### edit_file：九段式模糊匹配

LLM 在编辑文件时，通常需要提供 `old_content` 和 `new_content`。问题在于，模型给出的 `old_content` 经常与真实文件只“差一点点”，比如尾部空格不同、缩进不一致、转义序列变化、或者从记忆里重建了近似代码。若只做严格精确匹配，编辑工具会频繁报出“content not found”，把上下文浪费在失败和重试上。

OpenDev 的 `edit_file` 使用九段式 replacer 链，以责任链模式依次处理不同类型的不匹配：

- 精确匹配
- 空白规范化
- 缩进弹性
- 转义处理
- 上下文锚点匹配
- 以及更多逐步放宽的匹配策略

每个 replacer 返回的不是搜索串本身，而是“在原文件中真实找到的那段文本”，因此替换仍然能保留文件本来的格式。匹配链遇到第一个成功项就短路返回，所以精确匹配不会为模糊匹配多付额外成本。

除此之外，`edit_file` 还集成了多项安全与反馈机制：

- stale-read 校验
- 唯一性校验，避免多重匹配导致静默误改
- undo 备份
- 调用 `lsp.touch_file(filepath)` 通知 LSP 服务刷新
- 最多等待 3 秒收集 Error 级诊断
- 在工具输出中附加最多 20 条结构化 LSP 错误，帮助 agent 在同一轮内自我修复
- 为用户生成 unified diff

这样，`edit_file` 不只是“替换文本”，而是一个具备匹配恢复、并发保护、编辑反馈和可回滚性的工程级编辑器。

### list_files：目录树与 glob 搜索

`list_files` 用于枚举目录内容或按 glob 模式搜索文件。主要参数：

- `path`
- `pattern`
- `max_results`

返回结果会以树状结构呈现，同时默认忽略一批常见噪音目录，例如 `node_modules`、`.git`、`__pycache__`、`.venv`、`.DS_Store` 等。输出总量还会被限制在 500 项以内，防止大型仓库目录树直接冲垮上下文。

### search：文本搜索与 AST 搜索双模式

`search` 提供两种互补模式：

- `type="text"`：调用 ripgrep，适合高性能正则内容搜索，支持上下文行与完整 PCRE2 模式。
- `type="ast"`：调用 ast-grep，适合结构化代码搜索，支持 `$VAR` 通配的语言感知模板。

参数包括：

- `pattern`
- `path`
- `type`
- `lang`

输出会被限制在最多 50 个命中和最多 30000 字符，以平衡搜索能力与上下文成本。

### 设计演化

最初版本的编辑工具只有两步：精确匹配，失败后再做一次去空白匹配。它是“content not found”错误的最大来源。后来系统对失败日志做归纳，发现 LLM 的格式漂移实际上可以分成若干稳定类型，例如空白差异、缩进偏移、转义变化、局部上下文锚定缺失。把这些模式抽象成九段式责任链之后，绝大多数编辑失败都被消除，同时又保留了精确匹配路径的零额外开销。

## 12.4.3 Shell 执行与后台任务

OpenDev 需要在测试、构建、开发服务器和系统交互场景下执行任意 shell 命令，因此进程系统既必须强大，又必须严格受控。围绕这一需求，OpenDev 提供四个主要工具：`run_command`、`list_processes`、`get_process_output` 和 `kill_process`。

### run_command：六阶段执行流水线

`run_command` 会让每一条命令都经过六个阶段：

1. 安全闸门：优先拦截不可覆盖的危险模式。
2. 命令准备：自动确认 package manager 提示、让 Python 输出去缓冲。
3. 服务器检测：用一组框架正则判断该命令是否是长运行服务，并在必要时自动提升为后台模式。
4. 执行分叉：前台命令走普通管道执行，后台命令走 PTY 模式，并做进程组隔离。
5. 输出管理：输出最多保留 30000 字符，使用 head-tail 截断，并以 100ms 周期轮询。
6. 超时处理：同时使用 60 秒空闲超时和 600 秒绝对超时，并可接收 `InterruptToken`。

若命令被提升到后台，系统会交给 `BackgroundTaskManager` 管理，并生成一个 7 位十六进制任务 ID。后台任务会被记录状态，输出流会写入专属 output 文件，并由 daemon 线程持续追加。任务状态在 `RUNNING`、`COMPLETED`、`FAILED`、`KILLED` 之间切换，同时通过 listener 回调通知 UI。

### list_processes：查看后台任务

这个工具会返回当前系统追踪到的后台任务，包括：

- PID
- 状态
- 已运行时长

这样 agent 就可以判断有哪些服务仍在运行，哪些后台构建已经失败，或者哪些任务可能卡住了。

### get_process_output：读取后台任务输出

通过任务 ID 读取后台任务 output 文件的最后 100 行。它让 agent 在不重新运行命令的情况下就能查看：

- 开发服务器日志
- 测试结果
- 构建错误

这是长时间运行任务可观测性的关键。

### kill_process：优雅终止后台任务

`kill_process` 采用渐进式终止策略：

1. 对整个进程组发送 `SIGTERM`
2. 等待 5 秒让其优雅退出
3. 若仍未退出，则升级为 `SIGKILL`

与此同时，daemon 输出线程会被通知停止，PTY 主文件描述符也会被关闭。通过 kill 整个 process group，能够确保像 webpack dev server 这种会再拉起子进程的命令不会留下孤儿进程。

### 设计演化

OpenDev 最早用 `subprocess.run()` 加固定 timeout 处理所有命令，结果开发服务器几乎总会超时并被误杀。后来引入基于活动的 idle timeout 后，长生命周期服务终于能稳定存活；再配合 PTY 模式，解决了很多程序直到退出才一次性 flush 输出的缓冲问题。

## 12.4.4 Web 交互

OpenDev 提供四个 Web 工具：`fetch_url`、`web_search`、`capture_web_screenshot` 和 `open_browser`。这些工具全部是只读能力，因此在 plan mode 里也可以安全使用。

### fetch_url：基于浏览器引擎抓取网页

`fetch_url` 使用 Crawl4AI 和 Playwright，而不是简单的 HTTP 请求。这一点非常关键，因为现代文档站点和 Web 应用大量依赖 JavaScript 渲染，单纯的 requests 很多时候根本拿不到有意义的内容。OpenDev 会等待页面渲染完成，再把 HTML 转成 markdown，方便模型低成本消费。

工具还支持多页深爬，爬取策略包括：

- BFS
- DFS
- best-first

用户还可以限制最大深度、最大页面数和域名范围，防止爬虫越界。为了避免磁盘滥用，文件下载会被直接阻止。

### web_search：隐私友好的 Web 搜索

`web_search` 基于 DuckDuckGo，返回最多 10 条结果，每条包含：

- 标题
- URL
- 摘要 snippet

工具还支持域名过滤，比如只搜索官方文档域名。常见工作流是：先 `web_search` 找候选页面，再用 `fetch_url` 抓取完整内容。

### capture_web_screenshot：网页截图

该工具通过 Playwright 无头浏览器生成整页截图，支持：

- 可配置 viewport，默认 1920×1080
- 不同响应式断点
- 可选 PDF 输出
- 最长 180 秒超时，以兼容重 JavaScript 页面

返回值是截图文件路径，agent 可以后续再引用、分析或展示给用户。

### open_browser：桥接用户视觉工作流

`open_browser` 会用系统默认浏览器打开 URL 或本地文件路径。本地文件会自动转换为 `file://` URI。这个工具的意义，在于连接“agent 的无头环境”和“用户的视觉确认流程”，尤其适合：

- 预览生成的 HTML
- 打开本地 Web 应用
- 查看 agent 无法处理认证流程的文档页面

### 设计演化

最初版本使用简单 HTTP 请求抓取网页，对现代 SPA 文档几乎完全失效。切换到 Crawl4AI + Playwright 后，系统终于能在内容抽取前等待完整 DOM 渲染，Web 能力才真正可用。

## 12.4.5 基于 LSP 的多语言语义代码分析

单纯文本搜索可以找字符串，却无法真正理解代码结构。比如“找某个方法的全部调用位置”，需要区分方法调用与变量同名、处理重载、跨文件追踪引用。自己为每种语言写语义分析器几乎不可行，因此 OpenDev 直接接入 Language Server Protocol，并复用现成语言服务器生态。

OpenDev 在符号系统上暴露六类工具：

- `find_symbol`
- `find_referencing_symbols`
- `rename_symbol`
- `replace_symbol_body`
- `insert_before_symbol`
- `insert_after_symbol`

### 四层 LSP 抽象

OpenDev 把这套系统组织为四层：

1. Agent Tool Layer：面向 agent 暴露六个 symbol 工具。
2. Symbol Retriever：提供统一语义查找 API。
3. LSP Server Wrapper：负责语言检测、server 池、生命周期管理。
4. Solid Language Server：负责 JSON-RPC、缓存、文件 buffer 和底层 LSP 协议操作。

这意味着，agent 看到的是一致的工具接口，而不是每种语言各自不同的 LSP 细节。

### 双层缓存

为了避免每次都走完整 LSP 往返，系统维护两级缓存，并以文件内容 MD5 为键：

- Level 1：缓存原始 LSP 响应
- Level 2：缓存加工后的 symbol tree、父子关系与 body preview

若文件内容没变，可以直接从 Level 2 返回；若内容变了但原始响应结构仍可复用，则只重建 Level 2。缓存落盘在项目内的 `.solidlsp/cache/<language_id>/` 中，并通过 version 字段控制兼容性。

### find_symbol：查定义

支持：

- 完整限定名，例如 `MyClass.method`
- 部分路径匹配
- 通配匹配，例如 `My*`

返回结果包含 symbol kind、位置、完整 name path 和 body preview。若存在多个匹配，会全部列出，让 agent 自己做消歧。

### find_referencing_symbols：跨文件找引用

该工具会语义级别查找某个 symbol 的所有引用，包括：

- 调用点
- import
- type annotation

它非常适合在重构前做影响面分析。

### rename_symbol：语义级重命名

`rename_symbol` 会把新的名字先校验为合法标识符，然后按 LSP server 返回的 workspace edits 执行修改，并在每个文件中倒序应用编辑，避免前面的改动影响后面的行列偏移。它只会改真正的代码引用，不会误动注释和字符串。

### replace_symbol_body：保留签名的重写

这个工具专门解决“重写实现，但不要顺手改坏接口”的问题。它会识别函数或方法体边界，只替换 body，而保留：

- 函数签名
- decorator
- docstring

因此 agent 可以重写内部逻辑，却不容易破坏外部接口。

### insert_before_symbol / insert_after_symbol：基于符号位置插入

这两个工具允许 agent 把内容插在某个具名 symbol 前后，并自动匹配正确缩进和空行间隔。它们特别适合：

- 在相关方法旁边添加新方法
- 在调用者附近插入 helper function
- 在被测函数附近添加测试代码

### 设计演化

OpenDev 一开始也考虑过 tree-sitter 这类 AST 工具链，但 tree-sitter 更适合语法级解析，不擅长类型解析、跨文件引用和 workspace rename。LSP 生态的优势在于：每门语言的 server 都由领域专家持续维护，而 OpenDev 只需统一接入与调度。再加上按需启动和复用 server，资源开销也能随实际使用而伸缩，而不是为所有支持语言预启动一整套后台服务。

## 12.4.6 用户交互、任务管理与规划

OpenDev 并不是一个完全无人的黑箱执行器。它需要在关键节点上向用户确认方向、汇报进度、等待审批，并用结构化任务列表驱动后续实现。因此，系统提供了一组人机协作型工具，包括 `ask_user`、一组 todo 工具、`present_plan` 和 `task_complete`。

### ask_user：结构化多选问题

`ask_user` 一次最多可发出四个问题。每个问题都包含：

- 一个不超过 12 个字符的 header，用于 UI 中紧凑展示
- 2 到 4 个选项
- 每个选项对应的 label 和影响说明
- 可选的 `multiSelect`

系统还会自动追加 `Other` 自由输入项，避免用户只能在 agent 给出的选项里被迫二选一。

这个工具在不同前端会以不同方式渲染：

- TUI：modal dialog + 键盘导航
- Web UI：survey 风格组件 + WebSocket 回传

但在 agent 看来，它始终是同一个结构化交互接口。

### Todo 工具组：轻量 Kanban 任务追踪

OpenDev 用四个工具维护一个轻量级看板式任务列表：

- `write_todos`：创建或整体替换任务列表
- `update_todo`：按 ID、标题或 slug 修改任务
- `complete_todo`：将任务标记为完成，并可附带完成日志
- `list_todos`：按状态优先级返回任务列表

这里有一个关键约束：任意时刻最多只有一个任务能处于 `doing` 状态。设置新的 `doing` 任务时，之前那个会自动退回 `todo`。这使 agent 的注意力始终只聚焦在当前一项活动任务上。

### present_plan：计划审批

`present_plan` 会读取 plan 文件并展示给用户，等待三种可能的反馈：

- `approve_auto`：批准计划，并自动批准后续用于实现它的编辑
- `approve`：批准计划，但后续每次修改仍单独审批
- `modify`：拒绝并附带修改意见

一旦用户批准，plan 中的步骤会自动抽取进 todo 列表，变成后续执行的结构化追踪器。

### task_complete：显式完成信号

`task_complete` 是 ReAct executor 的一个关键终止信号。它让系统能够区分：

- agent 是真的认为任务完成了
- agent 只是迭代次数耗尽或随手输出了一段总结

若没有它，系统很难可靠判定任务到底是完成、失败还是被迫终止。

### 设计演化

早期系统缺少结构化用户交互，agent 只能输出自然语言问题，结果很难稳定解析。引入 `ask_user` 这种结构化多选格式后，回答质量和 UI 一致性都明显提升；计划审批与 todo 抽取的结合，也让 agent 从“说说计划”变成“按可追踪任务执行计划”。

## 12.4.7 通过 MCP 进行高 token 效率的外部工具发现

MCP 解决的是“如何接入外部工具服务”的问题，但它也会带来新的上下文成本问题。假设系统接入 100 个外部工具，每个 schema 平均 200 token，那么仅工具定义就要先吃掉 20000 token。如果一开始就把这些 schema 全部注入 prompt，无论模型是否会用，都极其浪费。OpenDev 因此采用 lazy discovery：工具先不进上下文，只有在真正搜索到或调用到时才按需注入。

### search_tools：基于关键字打分的按需发现

`search_tools` 是这套机制的入口。它会从已注册的 MCP 工具名字和描述中构造一个词汇表，提取至少 3 个字符的关键词，并对每个工具与查询之间做得分：

- 名称匹配记 2 分
- 描述匹配记 1 分

结果按总分排序返回给模型。该工具还支持三种 detail level：

- `names`：只返回工具名
- `brief`：返回简短描述
- `full`：在后续调用中引入完整 schema

匹配到的工具会被 `ToolRegistry.discover_mcp_tool()` 标记为已发现，并加入 `_discovered_mcp_tools` 集合。这样，真正的 schema 成本只会在相关工具被搜索或被直接调用后才产生。

### 直接调用与自动发现

若模型直接调用形如 `mcp__github__create_issue` 这样的 qualified tool name，系统也会自动将其标记为 discovered，而不要求先显式执行一次 `search_tools`。这让熟悉某个外部工具名的 agent 可以跳过搜索阶段，而不失去 lazy discovery 的好处。

### 设计演化

最初实现会把所有外部工具 schema 无差别注入每次调用，导致上下文在第一条用户消息前就被吃掉 40% 左右。引入 lazy discovery 后，基线开销降到几乎可以忽略，只有真正使用过的能力才会逐步扩张上下文。

## 12.4.8 Subagent 委派、Skills 与 Batch 执行

有些能力不能仅靠“单个工具调用”扩展出来，而需要更高层的组合机制。OpenDev 在这一层提供三种能力：subagent delegation、按需 skill 加载，以及 batch execution。

### spawn_subagent：隔离的子智能体委派

`spawn_subagent` 会拉起一个隔离运行的子智能体，它拥有自己的 ReAct loop、自己的 iteration budget，以及经过过滤的工具集合。不同 subagent 类型对应不同任务域，例如：

- `Code-Explorer`
- `Planner`
- `PR-Reviewer`
- `Security-Reviewer`
- `Web-Clone`
- `Web-Generator`
- `Project-Init`
- `Ask-User`

每一种 subagent 都只拿到与自身职责相符的工具集合，以限制误操作与角色混淆。

一个关键设计是自动并行化：如果主 agent 在同一轮里发出了多个 `spawn_subagent` 调用，`SubAgentManager` 会通过并发执行同时跑起这些子任务。这样 agent 可以自然地把“分析认证模块”和“检查数据库 schema”这类互不依赖的问题并行展开，而不需要在 prompt 里自己手工调度线程。

`spawn_subagent` 还支持：

- 模型覆写
- 后台执行
- 按 agent ID 恢复 session

这些能力让 subagent 既能承担一次性子任务，也能发展成多轮持续工作流。

### invoke_skill：按需加载领域知识

Skill 是以 markdown + YAML frontmatter 存储的知识单元，用于封装某类领域经验，例如 Git 约定、Code Review 检查表、部署流程等。如果一开始就把这些内容全部加载进上下文，成本非常高。OpenDev 因此把 skill 处理拆成两阶段：

第一阶段是元数据发现。系统启动时，`SkillLoader` 只扫描 skill frontmatter，提取名字和描述，形成轻量索引，并把这个索引放进 system prompt，让 agent 先知道“有哪些技能存在”。

第二阶段是按需加载。当 agent 判断某项 skill 与当前问题相关，就调用 `invoke_skill`。此时 loader 才读取完整 markdown 内容，剥离 frontmatter，把正文真正注入对话上下文。

系统还带有 session 级去重缓存，因此同一个 skill 在同一会话中最多只会被完整加载一次，避免重复污染上下文。

Skill 来源遵循三层优先级：

- 项目本地：`.opendev/skills/`
- 用户全局：`~/.opendev/skills/`
- 内建 skills

同名 skill 以高优先级来源覆盖低优先级来源，使项目可以覆写默认行为。

### batch_tool：减少多轮 LLM 往返

`batch_tool` 允许 agent 在同一轮里提交多个工具调用，从而减少 round-trip 开销。它支持两种执行模式：

- `parallel`：适用于独立操作，如并行读取多个文件
- `serial`：适用于有依赖顺序的操作，如先建目录再写文件

这里执行模式由 agent 显式指定，而不是系统自动推断。原因很现实：只有 agent 自己知道当前多个操作之间是否存在上下文依赖。系统曾尝试做自动依赖推断，但结果并不可靠；最终让拥有完整任务上下文的 agent 自己声明 `parallel` 还是 `serial`，反而是最稳定的选择。

### 设计演化

最早的 OpenDev 没有 batch execution，于是读取多个文件必须消耗多轮 LLM 调用；skills 在启动时整体加载，白白占掉大量从未用到的上下文；subagent 也默认串行执行，即便子任务之间互不依赖。当前架构分别用 `batch_tool`、双阶段 skill 加载与自动并行 subagent 执行，解决了这三个明显瓶颈。

## 小结

OpenDev 的工具系统，本质上是在回答三个问题：模型应该知道哪些能力、哪些能力可以安全执行、以及这些能力如何在上下文受限的条件下高效扩展。为此，系统把 schema 构建、执行路由和生命周期 hook 分离；对文件、Shell、Web、LSP、任务管理、MCP 与 subagent 设计各自的专门 handler；再通过审批、danger rules、stale-read、LSP 反馈与 hook 阻断把安全控制贯穿全链路。最终形成的不是一组工具，而是一套既能持续扩展、又能在真实开发环境里稳定运行的能力基础设施。
