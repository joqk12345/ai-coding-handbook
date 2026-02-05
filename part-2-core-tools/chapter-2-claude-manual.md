# 第2章: Claude 使用手册

> **关于"claude-code"**: 您可能在社区中听到"claude-code"的说法。需要说明的是，这并非 Anthropic 官方发布的一款独立产品，而是开发者社区对于 Claude 系列模型（如 Claude 3 家族）在代码生成、分析和重构等任务上所展现出的卓越能力的统称。本章将聚焦于此，详细探讨如何将 Claude 作为顶尖的编程工具来使用。

在第一章中，我们探讨了 AI 编程带来的范式转移。现在，让我们深入第一个核心工具：Claude。它不仅是这场变革中的关键角色，其独特的设计哲学也为我们如何与 AI 安全、高效地协作提供了重要启示。

## 2.1 Claude 简介

Claude 是由 Anthropic 公司开发的一系列大型语言模型。与许多追求单一能力极限的模型不同，Anthropic 从创立之初就将"AI 安全"置于核心地位。

### 2.1.1 核心设计理念：Constitutional AI

Claude 最独特之处在于其训练方法——**"Constitutional AI" (CAI，可译为"宪法AI")**。这套方法旨在让 AI 的行为与一套预设的"宪法"（即一系列原则和价值观）保持一致，而无需大量的人工监督。

简而言之，它包含两个阶段：
1. **监督学习阶段**：模型被要求根据一套原则（例如，"选择最无害、最有帮助的回答"）来批判和修改自己的回答。
2. **强化学习阶段**：模型根据其自我修正的能力获得奖励，从而学会自主地生成更安全、更符合伦理的输出。

对于开发者而言，这意味着 Claude 在被要求执行可能有风险或不道德的任务时，更有可能"推辞"或给出建设性的、安全的替代方案。

### 2.1.2 主要优势

1. **超长上下文窗口 (Long Context Window)**：这是 Claude 最显著的编程优势。它能处理数十万 tokens 的输入，相当于整本书的长度。这使得开发者可以一次性将整个代码库、复杂的文档或长篇的错误日志"喂"给 Claude，让它在完整的背景下进行分析、重构或回答问题，极大地提升了处理复杂任务的效率。

2. **强大的推理与对话能力**：Claude 在逻辑推理、遵循复杂指令和进行多轮对话方面表现出色。它能更好地理解你的真实意图，并在你提供修正意见时进行调整，使其成为一个优秀的编程"陪练"和"结对编程"伙伴。

## 2.2 核心编程能力

了解了 Claude 的设计哲学后，让我们聚焦于它在开发者工作流中的具体应用。

### 2.2.1 代码生成、补全与解释

- **用途**：根据自然语言描述创建代码片段、函数甚至整个类。
- **示例**："用 Python 写一个函数，接收一个 URL 列表，并异步下载所有内容。"
- **价值**：快速实现标准功能，减少手动编写样板代码的时间。对于不熟悉的代码，可以要求 Claude 逐行添加注释进行解释。

### 2.2.2 调试、错误分析与修复建议

- **用途**：粘贴错误信息和相关代码，让 Claude 分析原因并提供修复方案。
- **示例**：将 Python 的 `Traceback` 信息和导致错误的代码一起发给 Claude，并提问"为什么会发生这个错误？如何修复？"
- **价值**：大幅缩短调试时间，尤其是对于那些难以捉摸或不常见的错误。

### 2.2.3 基于大型代码库的问答与分析

- **用途**：利用其长上下文窗口，分析整个代码库的结构、依赖关系或特定功能的实现。
- **示例**：上传整个项目的文件内容，然后提问"请解释一下用户认证流程是如何实现的？涉及哪些文件和函数？"
- **价值**：快速熟悉陌生的遗留代码库，或进行高层次的架构分析。

### 2.2.4 跨语言、跨框架的代码翻译与重构

- **用途**：将一段用 Java 编写的算法，转换为 Python 实现；或将一个基于 Flask 的旧项目，重构为 FastAPI。
- **示例**："请将以下 Python 代码转换为等效的 Rust 代码，并保持其逻辑不变。"
- **价值**：降低技术栈迁移的门槛和工作量，辅助进行现代化改造。

### 2.2.5 代理执行与日常任务自动化

- **用途**：像 `claude-code` 这样的代理工具，可以直接在终端环境中执行日常编程任务。
- **示例**：指示 Claude "创建一个新的 Git 分支并提交我的修改"，或"运行测试并修复所有失败的测试用例"。
- **价值**：将自然语言指令无缝转化为实际操作，减少上下文切换，提高效率。

## 2.3 Claude Code 交互式模式

Claude Code 交互式模式是开发者与 AI 协作的核心界面。通过丰富的键盘快捷键、内置命令和交互功能，可以大幅提升开发效率。

### 2.3.1 键盘快捷键

#### 通用控制

| 快捷键 | 描述 | 上下文 |
|--------|------|--------|
| `Ctrl+C` | 取消当前输入或生成 | 标准中断信号 |
| `Ctrl+D` | 退出 Claude Code 会话 | EOF 信号 |
| `Ctrl+G` | 在默认文本编辑器中打开 | 编辑提示词或自定义响应 |
| `Ctrl+L` | 清除终端屏幕 | 保留对话历史 |
| `Ctrl+O` | 切换详细输出 | 显示详细的工具使用和执行信息 |
| `Ctrl+R` | 反向搜索命令历史 | 交互式搜索历史命令 |
| `Ctrl+V` / `Cmd+V` / `Alt+V` | 从剪贴板粘贴图片 | 粘贴图片或图片文件路径 |
| `Ctrl+B` | 后台运行任务 | 后台化 bash 命令和代理（Tmux 用户需按两次） |
| `←/→` | 在对话框标签间切换 | 在权限对话框和菜单中导航 |
| `↑/↓` | 浏览命令历史 | 召回之前的输入 |
| `Esc` + `Esc` | 回退代码/对话 | 将代码和/或对话恢复到之前的某个点 |
| `Shift+Tab` / `Alt+M` | 切换权限模式 | 在自动接受模式、计划模式和正常模式间切换 |
| `Option+P` / `Alt+P` | 切换模型 | 不清除提示词的情况下切换模型 |
| `Option+T` / `Alt+T` | 切换扩展思考 | 启用或禁用扩展思考模式（需先运行 `/terminal-setup`） |

#### 文本编辑

| 快捷键 | 描述 | 上下文 |
|--------|------|--------|
| `Ctrl+K` | 删除到行尾 | 保存已删除文本用于粘贴 |
| `Ctrl+U` | 删除整行 | 保存已删除文本用于粘贴 |
| `Ctrl+Y` | 粘贴已删除文本 | 粘贴用 `Ctrl+K` 或 `Ctrl+U` 删除的文本 |
| `Alt+Y`（在 `Ctrl+Y` 后） | 循环粘贴历史 | 在之前删除的文本中循环 |
| `Alt+B` | 光标后移一个单词 | 单词导航（macOS 需 Option 作为 Meta） |
| `Alt+F` | 光标前移一个单词 | 单词导航（macOS 需 Option 作为 Meta） |

#### 主题和显示

| 快捷键 | 描述 | 上下文 |
|--------|------|--------|
| `Ctrl+T` | 切换代码块语法高亮 | 仅在 `/theme` 选择器菜单内有效 |

#### 多行输入

| 方法 | 快捷键 | 上下文 |
|------|--------|--------|
| 快速转义 | `\` + `Enter` | 所有终端都支持 |
| macOS 默认 | `Option+Enter` | macOS 默认配置 |
| Shift+Enter | `Shift+Enter` | iTerm2, WezTerm, Ghostty, Kitty 默认支持 |
| 控制序列 | `Ctrl+J` | 换行符实现多行 |
| 粘贴模式 | 直接粘贴 | 用于代码块、日志 |

#### 快速命令

| 快捷键 | 描述 | 备注 |
|--------|------|------|
| `/` 在开头 | 命令或技能 | 查看内置命令和技能 |
| `!` 在开头 | Bash 模式 | 直接运行命令并将输出添加到会话 |
| `@` | 文件路径提及 | 触发文件路径自动补全 |

### 2.3.2 内置命令

内置命令是常用操作的快捷方式。在 Claude Code 中输入 `/` 可查看完整列表，或输入 `/` 后跟任意字母进行过滤。

#### 常用命令

| 命令 | 用途 |
|------|------|
| `/clear` | 清除对话历史 |
| `/compact [指令]` | 压缩对话，可选指定关注重点 |
| `/config` | 打开设置界面（配置标签） |
| `/context` | 以彩色网格可视化当前上下文使用情况 |
| `/cost` | 显示 token 使用统计 |
| `/debug [描述]` | 通过读取会话调试日志来排查问题 |
| `/doctor` | 检查 Claude Code 安装的健康状况 |
| `/exit` | 退出 REPL |
| `/export [文件名]` | 将当前对话导出到文件或剪贴板 |
| `/help` | 获取使用帮助 |
| `/init` | 使用 `CLAUDE.md` 指南初始化项目 |
| `/mcp` | 管理 MCP 服务器连接和 OAuth 认证 |
| `/memory` | 编辑 `CLAUDE.md` 记忆文件 |
| `/model` | 选择或更改 AI 模型（立即生效） |
| `/permissions` | 查看或更新权限 |
| `/plan` | 直接从提示词进入计划模式 |
| `/rename <名称>` | 重命名当前会话以便识别 |
| `/resume [会话]` | 按 ID 或名称恢复对话，或打开会话选择器 |
| `/rewind` | 回退对话和/或代码 |
| `/stats` | 可视化每日使用、会话历史、连续记录和模型偏好 |
| `/status` | 打开设置界面（状态标签）显示版本、模型、账户和连接 |
| `/statusline` | 设置 Claude Code 的状态栏 UI |
| `/copy` | 将最后的助手响应复制到剪贴板 |
| `/tasks` | 列出和管理后台任务 |
| `/teleport` | 从 claude.ai 恢复远程会话（订阅者） |
| `/theme` | 更改颜色主题 |
| `/todos` | 列出当前的 TODO 项 |
| `/usage` | 显示计划使用限制和速率限制状态（订阅计划） |

#### MCP 提示词

MCP 服务器可以暴露为命令的提示词。这些使用格式 `/mcp__<server>__<prompt>` 并从连接的服务器动态发现。

### 2.3.3 Vim 编辑器模式

使用 `/vim` 命令启用 vim 风格编辑，或通过 `/config` 永久配置。

#### 模式切换

| 命令 | 动作 | 源模式 |
|------|------|--------|
| `Esc` | 进入 NORMAL 模式 | INSERT |
| `i` | 在光标前插入 | NORMAL |
| `I` | 在行首插入 | NORMAL |
| `a` | 在光标后插入 | NORMAL |
| `A` | 在行尾插入 | NORMAL |
| `o` | 在下方打开新行 | NORMAL |
| `O` | 在上方打开新行 | NORMAL |

#### 导航（NORMAL 模式）

| 命令 | 动作 |
|------|------|
| `h`/`j`/`k`/`l` | 左/下/上/右移动 |
| `w` | 下一个单词 |
| `e` | 单词末尾 |
| `b` | 上一个单词 |
| `0` | 行首 |
| `$` | 行尾 |
| `^` | 第一个非空字符 |
| `gg` | 输入开头 |
| `G` | 输入末尾 |
| `f{字符}` | 跳转到下一个字符出现处 |
| `F{字符}` | 跳转到上一个字符出现处 |
| `t{字符}` | 跳转到下一个字符前 |
| `T{字符}` | 跳转到上一个字符后 |
| `;` | 重复最后的 f/F/t/T 动作 |
| `,` | 反向重复最后的 f/F/t/T 动作 |

#### 编辑（NORMAL 模式）

| 命令 | 动作 |
|------|------|
| `x` | 删除字符 |
| `dd` | 删除行 |
| `D` | 删除到行尾 |
| `dw`/`de`/`db` | 删除单词/到末尾/到开头 |
| `cc` | 修改行 |
| `C` | 修改到行尾 |
| `cw`/`ce`/`cb` | 修改单词/到末尾/到开头 |
| `yy`/`Y` | 复制行 |
| `yw`/`ye`/`yb` | 复制单词/到末尾/到开头 |
| `p` | 在光标后粘贴 |
| `P` | 在光标前粘贴 |
| `>>` | 缩进行 |
| `<<` | 取消缩进行 |
| `J` | 连接行 |
| `.` | 重复最后的修改 |

#### 文本对象（NORMAL 模式）

文本对象可与 `d`、`c`、`y` 等操作符配合使用：

| 命令 | 动作 |
|------|------|
| `iw`/`aw` | 单词内部/周围 |
| `iW`/`aW` | WORD 内部/周围（空格分隔） |
| `i"`/`a"` | 双引号内部/周围 |
| `i'`/`a'` | 单引号内部/周围 |
| `i(`/`a(` | 括号内部/周围 |
| `i[`/`a[` | 方括号内部/周围 |
| `i{`/`a{` | 花括号内部/周围 |

### 2.3.4 命令历史与搜索

Claude Code 为当前会话维护命令历史：

- 历史记录按工作目录存储
- 使用 `/clear` 命令清除
- 使用 ↑/↓ 箭头导航
- 注意：历史扩展（`!`）默认禁用

#### 使用 Ctrl+R 反向搜索

按 `Ctrl+R` 交互式搜索命令历史：

1. **开始搜索**：按 `Ctrl+R` 激活反向历史搜索
2. **输入查询**：输入文本在之前的命令中搜索 - 搜索词会在匹配结果中高亮显示
3. **导航匹配**：再次按 `Ctrl+R` 循环浏览更早的匹配
4. **接受匹配**：
   - 按 `Tab` 或 `Esc` 接受当前匹配并继续编辑
   - 按 `Enter` 接受并立即执行命令
5. **取消搜索**：
   - 按 `Ctrl+C` 取消并恢复原始输入
   - 在空搜索时按 `Backspace` 取消

搜索显示匹配的命令并高亮搜索词，便于查找和重用之前的输入。

### 2.3.5 后台任务与 Bash 模式

#### 后台运行的工作原理

当 Claude Code 在后台运行命令时，它会异步执行命令并立即返回后台任务 ID。Claude Code 可以响应新提示词，同时命令继续在后台执行。

后台运行命令的方式：
- 提示 Claude Code 在后台运行命令
- 按 `Ctrl+B` 将常规 Bash 工具调用移到后台（Tmux 用户因 tmux 前缀键需按两次）

**关键特性：**
- 输出被缓冲，Claude 可使用 TaskOutput 工具检索
- 后台任务有唯一 ID 用于跟踪和输出检索
- Claude Code 退出时自动清理后台任务

要禁用所有后台任务功能，将 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` 环境变量设为 `1`。

**常见的后台命令：**
- 构建工具（webpack, vite, make）
- 包管理器（npm, yarn, pnpm）
- 测试运行器（jest, pytest）
- 开发服务器
- 长时间运行的进程（docker, terraform）

#### 使用 `!` 前缀的 Bash 模式

通过在输入前加 `!` 直接运行 bash 命令，不经过 Claude：

```bash
! npm test
! git status
! ls -la
```

Bash 模式：
- 将命令及其输出添加到对话上下文
- 显示实时进度和输出
- 支持同样的 `Ctrl+B` 后台处理长时间运行的命令
- 不需要 Claude 解释或批准命令
- 支持基于历史的自动补全：输入部分命令并按 `Tab` 从当前项目之前的 `!` 命令中完成

这对在保持对话上下文的同时快速执行 shell 操作很有用。

### 2.3.6 智能辅助功能

#### 提示词建议

首次打开会话时，提示词输入中会出现灰色的示例命令，帮助你开始。Claude Code 从项目的 git 历史中选择这个命令，反映你最近处理过的文件。

Claude 响应后，建议继续基于对话历史出现，例如多部分请求的后续步骤或工作流的自然延续。

- 按 `Tab` 接受建议，或按 `Enter` 接受并提交
- 开始输入以忽略它

建议作为后台请求运行，重用父对话的提示词缓存，因此额外成本最小。当缓存冷时，Claude Code 会跳过建议生成以避免不必要的成本。

要完全禁用提示词建议，设置环境变量或在 `/config` 中切换设置：

```bash
export CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false
```

#### 任务列表

处理复杂的多步骤工作时，Claude 会创建任务列表来跟踪进度。任务出现在终端的状态区域，带有指示器显示待处理、进行中或已完成的内容。

- 按 `Ctrl+T` 切换任务列表视图。显示最多 10 个任务
- 要查看所有任务或清除它们，直接询问 Claude："显示所有任务"或"清除所有任务"
- 任务在上下文压缩后持续存在，帮助 Claude 在大型项目中保持组织
- 要跨会话共享任务列表，设置 `CLAUDE_CODE_TASK_LIST_ID` 使用 `~/.claude/tasks/` 中的命名目录

#### PR 审查状态

当在有开放拉取请求的分支上工作时，Claude Code 在页脚显示可点击的 PR 链接（例如"PR #446"）。链接有彩色下划线指示审查状态：

- 绿色：已批准
- 黄色：待审查
- 红色：请求更改
- 灰色：草稿
- 紫色：已合并

`Cmd+click`（Mac）或 `Ctrl+click`（Windows/Linux）链接在浏览器中打开拉取请求。状态每 60 秒自动更新。

### 2.3.7 交互模式最佳实践

1. **熟练使用键盘快捷键**：特别是 `Ctrl+R` 历史搜索和 `Ctrl+O` 详细输出，可以大幅提升效率
2. **利用多行输入**：对于复杂的代码块或长提示词，使用 `\` + `Enter` 或 `Option+Enter` 分行
3. **善用后台任务**：长时间运行的命令（测试、构建）用 `Ctrl+B` 后台化，继续其他工作
4. **配置 Vim 模式**：如果熟悉 Vim，启用 vim 模式可以提升编辑效率
5. **使用 Bash 模式**：简单命令用 `!` 前缀直接执行，避免不必要的 AI 处理
6. **管理上下文**：定期使用 `/compact` 压缩对话，或使用 `/context` 查看上下文使用情况
7. **任务跟踪**：对于复杂项目，依赖任务列表功能，使用 `Ctrl+T` 切换视图

## 2.4 与 Claude 高效协作的最佳实践

与 Claude 的协作远不止于提出问题那么简单，它更像是一门艺术和科学的结合——即所谓的"提示工程"（Prompt Engineering）。高效的提示能充分发挥 Claude 的潜力，而模糊的指令则可能导致南辕北辙的结果。

### 2.4.1 构建清晰的上下文

- **明确任务目标**：清晰地阐述你想要 Claude 完成什么，以及为什么。
- **提供相关代码片段**：当讨论特定代码时，直接提供代码，而不是模糊地描述。
- **指定约束条件**：明确语言、框架、版本、性能要求、安全考量等。
- **错误信息与日志**：在调试时，提供完整的错误堆栈和相关日志，帮助 Claude 快速定位问题。
- **利用代理模式**：对于 `claude-code` 等代理工具，可以直接让 Claude 访问和理解你的代码库环境。

### 2.4.2 迭代式对话

- **渐进式引导**：不要期望 Claude 一次性完成所有复杂任务。将大问题拆解成一系列小问题，逐步引导它。
- **提供明确反馈**：当 Claude 的输出不符合预期时，提供具体且建设性的反馈。
- **寻求替代方案**：要求 Claude 提供多个解决方案，对比其优缺点。

### 2.4.3 角色扮演技巧

- **设定专业角色**：通过设定角色（例如"你是一位资深的 Python 后端工程师"、"你是一位专注于性能优化的 Go 语言专家"），可以引导 Claude 生成更符合特定语境、风格和专业水准的代码及建议。

### 2.4.4 发挥长上下文优势

- **全局视角**：利用 Claude 的超长上下文窗口，一次性提供整个文件、相关模块、甚至整个项目的部分代码。
- **持续对话**：在一个较长的对话中，Claude 会记住之前的上下文，这使得你可以围绕一个大型项目进行持续、深入的讨论和迭代。

### 2.4.5 Git 工作流集成

- **终端代理的强大**：通过 `claude-code` 这样的代理工具，可以直接指示 Claude 执行 Git 命令。
- **自动化版本控制**：例如，你可以指令 Claude "在 `feature/new-login` 分支上开始工作"、"完成当前功能后，暂存所有修改并提交"。
- **代码审查辅助**：让 Claude 检查当前分支与 `main` 分支的差异，并生成一份代码审查报告。

### 2.4.6 插件与扩展

- **定制化工作流**：`claude-code` 支持通过插件来扩展其功能。这意味着开发者可以根据自己的特定需求和工作流，为 Claude 定制工具和接口。

## 2.5 实战场景演练

本节将通过具体的编程案例，展示如何将上述最佳实践应用于实际开发中，充分发挥 Claude 作为 AI 编程助手的潜力。

### 2.5.1 场景一：从零到一构建 RESTful API

- **目标**：利用 Claude 快速搭建一个简单的用户管理 RESTful API。
- **步骤**：
  1. **需求分析与设计**：向 Claude 描述 API 的功能，并要求它设计数据库模型和 API 接口规范。
  2. **框架选择与初始化**：与 Claude 讨论选择合适的后端框架，并让它生成项目的基础结构。
  3. **核心逻辑实现**：逐步引导 Claude 实现用户模型、数据库交互、认证逻辑和 API 路由。
  4. **测试与验证**：要求 Claude 为生成的 API 编写单元测试和集成测试。
- **关键收获**：理解如何将一个复杂项目分解为可由 AI 协助的子任务。

### 2.5.2 场景二：遗留代码重构与优化

- **目标**：对一个具有可读性差、性能低下的遗留函数进行现代化重构和性能优化。
- **步骤**：
  1. **代码分析与问题诊断**：将遗留函数的代码粘贴给 Claude，要求它分析代码并指出潜在的改进点。
  2. **重构建议**：要求 Claude 提出具体的重构方案。
  3. **性能优化**：针对性能瓶颈，要求 Claude 提供优化建议，并逐步实现。
  4. **验证与测试**：要求 Claude 协助编写基准测试以验证性能改进。
- **关键收获**：学习如何利用 Claude 的分析能力来诊断问题。

### 2.5.3 场景三：自动化测试生成

- **目标**：为现有但缺乏测试覆盖的模块自动生成高质量的测试用例。
- **步骤**：
  1. **选择测试目标**：向 Claude 提供一个函数、类或模块的代码，说明其功能。
  2. **指定测试类型**：要求 Claude 生成单元测试、集成测试或端到端测试。
  3. **边界条件与异常处理**：特别要求 Claude 考虑各种边界条件和错误情况。
  4. **运行与修正**：将生成的测试代码集成到项目中运行，并根据结果进行修正。
- **关键收获**：掌握如何高效利用 AI 来提升测试覆盖率。

## 2.6 Hooks 与交互命令实战

本节通过实际案例展示如何配置和使用 Claude Code 的 Hooks 功能，以及如何熟练运用交互式命令提升开发效率。

### 2.6.1 Hooks 实战案例

#### 案例一：自动化代码风格检查

**场景**：每次保存代码后自动运行格式化工具，确保代码风格一致。

**步骤**：

1. 创建 Hook 脚本 `.claude/hooks/format-check.sh`：

```bash
#!/bin/bash
# .claude/hooks/format-check.sh

# 读取 hook 输入
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 只处理代码文件
if [[ ! "$FILE_PATH" =~ \.(ts|js|py|go|rs)$ ]]; then
  exit 0
fi

# 根据文件类型运行相应的格式化工具
case "$FILE_PATH" in
  *.ts|*.js)
    npx prettier --write "$FILE_PATH" 2>/dev/null
    npx eslint --fix "$FILE_PATH" 2>/dev/null
    ;;
  *.py)
    black "$FILE_PATH" 2>/dev/null
    ;;
  *.go)
    gofmt -w "$FILE_PATH" 2>/dev/null
    ;;
  *.rs)
    rustfmt "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
```

2. 赋予执行权限：

```bash
chmod +x .claude/hooks/format-check.sh
```

3. 配置 `.claude/settings.json`：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/format-check.sh",
            "async": true,
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

**效果**：每当 Claude 写入或编辑文件时，自动运行格式化工具，确保代码风格一致。

---

#### 案例二：敏感操作保护

**场景**：防止 Claude 执行危险命令，保护生产环境。

**步骤**：

1. 创建 Hook 脚本 `.claude/hooks/safety-check.sh`：

```bash
#!/bin/bash
# .claude/hooks/safety-check.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# 检测是否在生产目录
if [[ "$CWD" =~ /prod/|/production/ ]]; then
  # 阻止所有删除操作
  if echo "$COMMAND" | grep -qE '(rm|delete|drop)'; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "生产环境中禁止执行删除操作"
      }
    }'
    exit 0
  fi
fi

# 检测危险命令模式
DANGER_PATTERNS=(
  "rm -rf /"
  "rm -rf /.*"
  ":> /"
  "dd if=/"
  "mkfs"
  "chmod -R 777"
)

for pattern in "${DANGER_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -q "$pattern"; then
    jq -n "{
      hookSpecificOutput: {
        hookEventName: \"PreToolUse\",
        permissionDecision: \"ask\",
        permissionDecisionReason: \"检测到危险命令模式: $pattern\"
      }
    }"
    exit 0
  fi
done

exit 0
```

2. 配置 `.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/safety-check.sh"
          }
        ]
      }
    ]
  }
}
```

**效果**：在生产环境中自动阻止危险命令，或在检测到可疑操作时提示用户确认。

---

#### 案例三：会话启动自动配置

**场景**：每次启动会话时自动加载项目上下文。

**步骤**：

1. 创建 Hook 脚本 `.claude/hooks/session-init.sh`：

```bash
#!/bin/bash
# .claude/hooks/session-init.sh

INPUT=$(cat)
SOURCE=$(echo "$INPUT" | jq -r '.source // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# 只在首次启动时执行
if [ "$SOURCE" != "startup" ]; then
  exit 0
fi

# 构建项目上下文
CONTEXT=""

# 添加项目信息
if [ -f "$CWD/package.json" ]; then
  PROJECT_NAME=$(jq -r '.name // "unknown"' "$CWD/package.json")
  CONTEXT="项目名称: $PROJECT_NAME\n"
fi

# 添加最近修改的文件
if [ -d "$CWD/.git" ]; then
  RECENT_FILES=$(git diff --name-only HEAD~5..HEAD 2>/dev/null | head -5)
  if [ -n "$RECENT_FILES" ]; then
    CONTEXT="$CONTEXT\n最近修改的文件:\n$RECENT_FILES\n"
  fi
fi

# 添加当前分支
if [ -d "$CWD/.git" ]; then
  BRANCH=$(git branch --show-current 2>/dev/null)
  if [ -n "$BRANCH" ]; then
    CONTEXT="$CONTEXT\n当前分支: $BRANCH\n"
  fi
fi

# 添加环境变量
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export PROJECT_ROOT="'"$CWD"'"' >> "$CLAUDE_ENV_FILE"

  # 检测项目类型并设置相应环境
  if [ -f "$CWD/package.json" ]; then
    echo 'export PROJECT_TYPE=node' >> "$CLAUDE_ENV_FILE"
  elif [ -f "$CWD/pyproject.toml" ] || [ -f "$CWD/requirements.txt" ]; then
    echo 'export PROJECT_TYPE=python' >> "$CLAUDE_ENV_FILE"
  elif [ -f "$CWD/go.mod" ]; then
    echo 'export PROJECT_TYPE=go' >> "$CLAUDE_ENV_FILE"
  fi
fi

# 返回上下文
jq -n "{
  hookSpecificOutput: {
    hookEventName: \"SessionStart\",
    additionalContext: $(echo -e "$CONTEXT" | jq -Rs .)
  }
}"
```

2. 配置 `.claude/settings.json`：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/session-init.sh"
          }
        ]
      }
    ]
  }
}
```

**效果**：每次启动会话时自动加载项目信息、最近修改的文件和当前分支，帮助 Claude 更好地理解项目状态。

---

#### 案例四：提交前自动验证

**场景**：在 Claude 尝试提交代码前自动运行测试和检查。

**步骤**：

1. 创建 Hook 脚本 `.claude/hooks/pre-commit.sh`：

```bash
#!/bin/bash
# .claude/hooks/pre-commit.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# 只在 git commit 时执行
if ! echo "$COMMAND" | grep -q "git commit"; then
  exit 0
fi

# 运行测试
echo "运行测试套件..."
if command -v npm &> /dev/null && [ -f "package.json" ]; then
  npm test 2>&1
  TEST_RESULT=$?
elif command -v pytest &> /dev/null; then
  pytest 2>&1
  TEST_RESULT=$?
else
  TEST_RESULT=0
fi

if [ $TEST_RESULT -ne 0 ]; then
  jq -n '{
    decision: "block",
    reason: "测试未通过，请修复后再提交"
  }'
  exit 0
fi

# 运行 linting
echo "运行代码检查..."
if command -v npm &> /dev/null && [ -f "package.json" ]; then
  npm run lint 2>&1
  LINT_RESULT=$?
else
  LINT_RESULT=0
fi

if [ $LINT_RESULT -ne 0 ]; then
  jq -n '{
    decision: "block",
    reason: "代码检查未通过，请修复 lint 错误"
  }'
  exit 0
fi

# 所有检查通过
exit 0
```

2. 配置 `.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/pre-commit.sh",
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

**效果**：在提交前自动运行测试和代码检查，确保只有通过验证的代码才能提交。

---

### 2.6.2 交互式命令实战案例

#### 案例一：完整开发工作流

**场景**：从零开始实现一个新功能并提交。

```
# 步骤1：初始化项目
/init

# 步骤2：查看当前上下文使用情况
/context

# 步骤3：开始新功能开发
创建一个用户登录功能，包括：
- JWT 认证
- 密码加密
- 登录状态管理

# 步骤4：切换到详细模式查看执行细节
Ctrl+O

# 步骤5：后台运行测试
运行测试套件
Ctrl+B (后台化)

# 步骤6：查看任务列表
Ctrl+T

# 步骤7：压缩对话以节省上下文
/compact 保留用户登录相关的上下文

# 步骤8：查看 token 使用情况
/cost

# 步骤9：提交代码
暂存所有修改并提交，信息为 "feat: implement user authentication with JWT"

# 步骤10：导出对话记录
/export login-feature-session.md
```

---

#### 案例二：调试工作流

**场景**：使用交互命令快速定位和修复问题。

```
# 步骤1：启动调试模式
/debug 测试失败，用户登录后无法正确设置 cookie

# 步骤2：查看详细输出
Ctrl+O (开启详细模式)

# 步骤3：查看特定文件
@src/auth/login.ts

# 步骤4：运行特定测试
! npm test -- --testNamePattern="login"

# 步骤5：反向搜索之前的相关命令
Ctrl+R
输入: cookie

# 步骤6：使用 Vim 模式编辑代码
/vim
(进入 NORMAL 模式)
/Error (搜索 Error 相关代码)
n (跳转到下一个匹配)

# 步骤7：回退到之前的状态
Esc+Esc

# 步骤8：修复后重新测试
运行登录测试
```

---

#### 案例三：代码审查工作流

**场景**：审查 Pull Request 并提供反馈。

```
# 步骤1：查看当前分支状态
! git status

# 步骤2：查看与主分支的差异
! git diff main...feature/login --stat

# 步骤3：查看 PR 审查状态
(页脚显示 PR 链接，Cmd+click 打开)

# 步骤4：使用 Agent 驱动的代码审查
请审查当前分支的所有改动，关注：
1. 安全性问题
2. 代码风格一致性
3. 测试覆盖率
4. 性能考虑

# 步骤5：生成审查报告
/export pr-review-report.md

# 步骤6：压缩对话保留审查上下文
/compact 保留代码审查相关的讨论

# 步骤7：复制审查结果
/copy
```

---

### 2.6.3 Hooks 配置最佳实践

#### 1. 层级化配置

```
~/.claude/settings.json        # 用户级配置（所有项目）
  ├─ 基础安全规则
  └─ 个人偏好设置

.claude/settings.json          # 项目级配置（可共享）
  ├─ 项目特定 Hooks
  └─ 团队规范

.claude/settings.local.json    # 本地配置（不共享）
  └─ 敏感信息（API 密钥等）
```

#### 2. Hook 性能优化

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/lint.sh",
            "async": true,
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

**优化要点**：
- 使用 `async: true` 避免阻塞
- 设置合理的 `timeout`
- 在脚本中提前过滤不必要的执行

#### 3. 错误处理

```bash
#!/bin/bash
set -euo pipefail  # 严格模式

trap 'echo "Hook failed with exit code $?"' ERR

# Hook 逻辑
...
```

---

### 2.6.4 快速参考卡片

#### 常用 Hook 事件速查

| 事件 | 触发时机 | 常用用途 |
|------|----------|----------|
| `SessionStart` | 会话启动 | 加载上下文、设置环境 |
| `PreToolUse` | 工具执行前 | 安全检查、权限控制 |
| `PostToolUse` | 工具执行后 | 代码检查、格式化 |
| `UserPromptSubmit` | 提交提示前 | 内容验证、上下文注入 |
| `Stop` | Claude 停止前 | 验证完成度 |

#### 常用交互命令速查

| 命令 | 用途 |
|------|------|
| `/init` | 初始化项目 |
| `/context` | 查看上下文 |
| `/compact` | 压缩对话 |
| `/cost` | 查看 token 使用 |
| `/tasks` | 管理任务列表 |
| `/export` | 导出对话 |
| `/debug` | 调试会话 |
| `Ctrl+R` | 搜索历史 |
| `Ctrl+B` | 后台任务 |
| `Ctrl+T` | 切换任务列表 |
