---
id: "part-5-chapter-27-3-how-coding-agents-work"
title: "27.3 How Coding Agents Work：LLM、系统提示与工具循环"
slug: "part-5-chapter-27-3-how-coding-agents-work"
date: "2025-01-01"
type: "article"
topics:
  - "coding-agents"
  - "tools"
concepts:
  - "Token Budget"
  - "System Prompt"
  - "Tool Loop"
  - "Reasoning"
  - "Chat Template"
tools:
  - "OpenAI Codex"
  - "Claude Code"
  - "Gemini CLI"
architecture_layer:
  - "systems-and-governance"
timeline_era: "autonomous-systems"
related:
  - "part-5-chapter-27-harness-engineering-framework"
  - "part-5-chapter-27-2-the-anatomy-of-an-agent-harness"
  - "part-4-chapter-12-building-agent"
references: []
status: "published"
display_order: 973
---
# 27.3 How Coding Agents Work：LLM、系统提示与工具循环

> TL;DR：Coding agent 不是“会写代码的模型”，而是一个围绕 LLM 搭起来的 harness。模型负责预测下一个 token，agent 则负责保存对话状态、暴露工具、执行工具调用、回填结果，并在循环中把任务推进到完成。

## 为什么理解它的工作方式很重要

理解 coding agent 的底层机制，不是为了自己去重写一个 Codex 或 Claude Code，而是为了知道：

- 为什么有些任务会突然变慢、变贵、变笨；
- 为什么上下文一长，质量就会开始漂移；
- 为什么同一个模型，换一套工具和系统提示，表现会差很多；
- 为什么很多“Agent 能力”其实不是模型本身，而是 harness 的设计结果。

从工程角度看，**coding agent = LLM + system prompt + tools + a loop**。后面所有能力，包括读文件、跑命令、写补丁、调用子代理，本质上都是这个公式的扩展。

## 1. LLM：本质是 token completion engine

任何 coding agent 的核心都是大语言模型。模型名字会变，家族会换，但底层工作方式非常一致：它根据当前输入，预测接下来最可能出现的 token 序列。

这也是为什么说 LLM 并不是“直接理解单词”，而是在处理 token。文本会先被切成整数序列，再送进模型。这个细节很重要，因为：

- 计费通常按输入 token 和输出 token 计算；
- 上下文窗口的上限，本质上也是 token 上限；
- 一旦上下文里塞入太多历史消息、工具结果和文件内容，模型能用来真正思考问题的预算就会下降。

今天很多模型还是多模态的，但这并不改变底层原理。截图、照片和草图在进入 vision model 后，同样会被编码成可供模型处理的 token 表示。

## 2. Chat Template：把 completion engine 包装成“对话”

最早的 LLM 更像一个补全文本的引擎。你给它一句话，它补下一段。后来产品为了让交互更自然，逐步转向了 chat templating，也就是把 prompt 包装成一段“模拟对话”：

```text
user: write a python function to download a file from a URL
assistant:
```

模型再基于这个格式，补出 `assistant` 的回答。

这件事有两个容易被忽略的后果。

第一，**LLM 是无状态的**。它不会真的“记住上一次聊过什么”。每次调用时，底层都要把整个对话历史重新发给模型。

第二，**对话越长，成本越高**。因为你每问一次新问题，前面的历史都要重放一次：

```text
user: write a python function to download a file from a URL
assistant: def download_url(url): ...
user: use the requests library instead
assistant:
```

所以，长对话并不是“模型越聊越懂你”的免费红利，而是一个持续增长的 token 负担。

## 3. Token Caching：为什么 agent 尽量不去改旧消息

很多模型提供商会对短时间内重复出现的输入前缀做缓存定价优化。前面已经计算过的 token 前缀，如果下一次调用几乎不变，平台就能复用部分昂贵计算，从而降低延迟和成本。

这也是为什么成熟的 coding agent 会尽量保持早期上下文稳定，不轻易重写旧消息。它们不是“懒得整理”，而是在刻意保护 prompt cache。

从实现角度看，这意味着好的 agent 会：

- 尽量追加新消息，而不是回改旧消息；
- 避免频繁重写系统提示或工具描述；
- 把变化限制在会话尾部，让缓存前缀尽可能长。

## 4. Tool Calling：为什么模型能“读文件、跑命令、改代码”

LLM 本身只能接收输入并输出文本，它并不能真的读取文件或执行 Bash。所谓“工具调用”，本质上是 harness 给模型暴露了一组可调用函数，并教它在需要时输出特定格式的调用请求。

概念上看，大致像这样：

```text
system: If you need to access the weather, end your turn with <tool>get_weather(city_name)</tool>
user: what's the weather in San Francisco?
assistant: <tool>get_weather("San Francisco")</tool>
```

harness 看到这个文本后，会把它解析成一次真实函数调用，执行工具，再把结果回填给模型：

```text
user: <tool-result>61°, Partly cloudy</tool-result>
assistant:
```

到了 coding agent 里，`get_weather()` 会换成更有工程价值的工具：

- 读文件
- 搜索代码
- 执行终端命令
- 编辑文件
- 跑测试
- 调浏览器或 MCP 服务

于是，模型表面上看起来像“自己会操作电脑”，其实是 harness 在帮它把文本请求翻译成真实动作。

## 5. System Prompt：隐藏但关键的行为控制层

大多数 coding agent 在每轮对话最前面，都会插入一段用户看不见的 system prompt。这里定义的不是业务内容，而是行为边界：

- 你是谁；
- 你有哪些工具；
- 你应该先读后改，还是先计划后执行；
- 什么操作需要更谨慎；
- 什么情况下应该停止并向用户确认。

这部分提示往往很长，甚至会长到几百行。它是“模型能力”变成“产品行为”的第一层转换器。

同一个模型，在不同系统提示下，能呈现出完全不同的工程风格。这也是为什么今天讨论 coding agent，不能只盯模型版本，而必须同时看 system prompt 和 harness。

## 6. Reasoning：为什么有些模型会“先想一会儿”

2025 年之后，前沿模型广泛引入 reasoning 模式。很多产品在界面里把它叫做 `thinking`，但本质上就是：允许模型在正式给出答案前，先消耗更多时间和更多 token 去展开中间推理。

这对 coding agent 特别有用，因为编程任务经常不是“直接写答案”，而是：

- 先沿着调用链读代码；
- 再定位异常触发条件；
- 再决定先改哪一层；
- 最后还要结合测试结果回退或修正。

也就是说，reasoning 并不是“更会说”，而是给模型更多预算去走完一条更复杂的思维路径。调高 reasoning effort，本质上是在换取更深的分析和更高的 token 消耗。

## 7. 最小公式：LLM + system prompt + tools in a loop

把这些放在一起，coding agent 的最小工作机制其实非常朴素：

1. 用户提出任务。
2. harness 组装 system prompt、对话历史和可用工具。
3. LLM 生成下一步回复，可能是普通文本，也可能是工具调用。
4. 如果是工具调用，harness 执行工具并把结果作为新消息回填。
5. LLM 基于最新结果继续推理。
6. 循环往复，直到模型停止调用工具并给出最终回答。

这就是典型的 **tools in a loop**。很多复杂产品，看起来像有非常神秘的“Agent 智能”，但拆开以后，核心仍然是这个循环。

## 8. 这对构建者意味着什么

一旦接受 coding agent 的真实结构，你会更容易做出正确设计判断：

- **先管上下文，再谈能力**：上下文窗口是稀缺资源，历史消息、工具输出和系统提示都在竞争同一个预算。
- **先把工具面设计好**：模型是否好用，很大程度上取决于工具是否可发现、可调用、可恢复，而不是光看模型有多强。
- **把 agent 看成状态机，而不是聊天框**：真正的关键在循环、回填、校验、重试和停止条件。
- **reasoning 与工具是联动关系**：推理负责决定做什么，工具负责把动作落地，二者必须一起设计。
- **系统提示是行为软件**：它不是文案，而是控制面。写得差，模型再强也会出现错误路径。

## 总结

如果用一句话概括 coding agent 的工作原理，那就是：

> **它不是一个“懂代码的聊天机器人”，而是一套把 LLM、系统提示、工具调用和状态循环组合起来的执行系统。**

真正把模型变成 agent 的，不是“它会不会写函数”，而是 harness 是否把上下文、工具、推理和执行闭环组织好了。
