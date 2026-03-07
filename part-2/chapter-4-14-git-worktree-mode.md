# 2.14：Git Worktree 模式与 Agent 工具设计艺术

> *构建 Agent 最大的挑战之一是构建它的动作空间。设计工具是一门艺术，而非科学。*

## NAME

git-worktree - Manage multiple working trees

## SYNOPSIS

```
git worktree add [-f] [--detach] [--checkout] [--lock [--reason <string>]]
         [--orphan] [(-b | -B) <new-branch>] <path> [<commit-ish>]
git worktree list [-v | --porcelain [-z]]
git worktree lock [--reason <string>] <worktree>
git worktree move <worktree> <new-path>
git worktree prune [-n] [-v] [--expire <expire>]
git worktree remove [-f] <worktree>
git worktree repair [<path>…​]
git worktree unlock <worktree>
```

## DESCRIPTION

Manage multiple working trees attached to the same repository.

A git repository can support multiple working trees, allowing you to check out more than one branch at a time. With git worktree add a new working tree is associated with the repository, along with additional metadata that differentiates that working tree from others in the same repository. The working tree, along with this metadata, is called a "worktree".

This new worktree is called a "linked worktree" as opposed to the "main worktree" prepared by git-init or git-clone. A repository has one main worktree (if it's not a bare repository) and zero or more linked worktrees.

## COMMANDS

### add \<path\> [\<commit-ish\>]

Create a worktree at \<path\> and checkout \<commit-ish\> into it. The new worktree is linked to the current repository, sharing everything except per-worktree files such as HEAD, index, etc.

If \<commit-ish\> is omitted and neither -b nor -B nor --detach used, then the new worktree is associated with a branch named after the final component of \<path\>.

### list

List details of each worktree. The main worktree is listed first, followed by each of the linked worktrees. The output details include whether the worktree is bare, the revision currently checked out, the branch currently checked out, "locked" if the worktree is locked, "prunable" if the worktree can be pruned.

### lock

Lock a worktree to prevent its administrative files from being pruned automatically. This also prevents it from being moved or deleted. Optionally, specify a reason for the lock with --reason.

### move

Move a worktree to a new location. Note that the main worktree or linked worktrees containing submodules cannot be moved with this command.

### prune

Prune worktree information in $GIT_DIR/worktrees.

### remove

Remove a worktree. Only clean worktrees (no untracked files and no modification in tracked files) can be removed. Unclean worktrees or ones with submodules can be removed with --force. The main worktree cannot be removed.

### repair

Repair worktree administrative files, if possible, if they have become corrupted or outdated due to external factors.

### unlock

Unlock a worktree, allowing it to be pruned, moved or deleted.

## OPTIONS

- `-f`, `--force`: Override safeguards when creating worktree, moving locked worktree, or removing unclean worktree.
- `-b <new-branch>`, `-B <new-branch>`: Create a new branch named \<new-branch\> and check it out into the new worktree.
- `-d`, `--detach`: Detach HEAD in the new worktree.
- `--lock`: Keep the worktree locked after creation.
- `-n`, `--dry-run`: With prune, do not remove anything; just report what it would remove.
- `-v`, `--verbose`: With prune, report all removals. With list, output additional information.
- `--reason <string\>`: Specify a reason for locking the worktree.
- `--orphan`: Make the new worktree and index empty, associating the worktree with a new unborn branch.
- `--track`: When creating a new branch, mark it as "upstream" from the new branch.

## EXAMPLES

```
# Create a temporary worktree for an emergency fix
$ git worktree add -b emergency-fix ../temp master
$ pushd ../temp
# ... hack hack hack ...
$ git commit -a -m 'emergency fix for boss'
$ popd
$ git worktree remove ../temp
```

## Introducing: Built-in Git Worktree Support for Claude Code

Now, agents can run in parallel without interfering with one another. Each agent gets its own worktree and can work independently.

The Claude Code Desktop app has had built-in support for worktrees for a while, and now we're bringing it to CLI too.

---

## 从构建 Agent 的视角思考

构建 Agent 最大的挑战之一是**构建它的动作空间**。

Claude 通过 Tool Calling（工具调用）来执行操作，但在 Claude API 中有多种方式可以构建工具：bash、skills，以及最近的代码执行。

面对这么多选项，你如何设计你的 Agent 工具？你是否只需要一个工具（比如代码执行或 bash）？如果你有 50 个工具，分别对应 Agent 可能遇到的每个用例呢？

### 思考框架

为了把自己代入模型的思维，我喜欢想象被给了一个困难的数学问题。你需要什么工具来解决它？这取决于你自己的能力！

| 工具 | 能力 | 限制 |
|------|------|------|
| 纸笔 | 最低配置 | 受限于手动计算 |
| 计算器 | 更好 | 需要了解高级选项的操作 |
| 计算机 | 最快最强 | 需要知道如何编写和执行代码 |

> **这个框架对设计你的 Agent 很有用：你要给它的工具应该符合它自己的能力。**但你怎么知道这些能力是什么？你需要关注、阅读它的输出、实验。你要学会像 Agent 一样看待事物。

---

## 经验教训：从关注 Claude 中学习

### 改进引导与 AskUserQuestion 工具

构建 AskUserQuestion 工具的目标是提高 Claude 提问的能力（通常称为引导/elicitation）。

虽然 Claude 可以用纯文本提问，但我们发现回答这些问题感觉不必要地浪费时间。如何降低这种摩擦，增加用户和 Claude 之间通信的带宽？

#### 尝试 #1：编辑 ExitPlanTool

我们首先尝试在 ExitPlanTool 中添加一个参数，让它可以携带一组问题。这是最容易实现的，但让 Claude 感到困惑，因为我们同时在请求一个计划和一个关于计划的问题。如果用户的答案与计划所说的冲突怎么办？Claude 需要调用 ExitPlanTool 两次吗？我们需要另一种方法。

#### 尝试 #2：更改输出格式

接下来，我们尝试修改 Claude 的输出指令，让它使用稍微修改的 markdown 格式来提问。例如，我们可以让它输出一系列带选项的要点问题。然后我们可以解析和格式化这个问题作为 UI 展示给用户。

虽然这是我们能做的最通用的改变，Claude 甚至似乎可以很好地输出这种格式，但不能保证。Claude 会附加额外的句子，省略选项，或使用完全不同的格式。

#### 尝试 #3：AskUserQuestion 工具

最终，我们创建了一个 Claude 可以在任何时候调用的工具，但它在计划模式期间特别被提示调用。当工具触发时，我们会显示一个模态来展示问题，并阻塞 Agent 循环直到用户回答。

这个工具允许我们提示 Claude 输出结构化的东西，并帮助我们确保 Claude 给用户多个选项。它还给了用户组合这个功能的方式，例如在 Agent SDK 中调用它或在 skills 中引用它。

> **最重要的是，Claude 似乎喜欢调用这个工具，我们发现它的输出效果很好。**即使是最好的设计的工具，如果 Claude 不知道如何调用它，也不会起作用。

---

## 随能力更新：Tasks 与 Todos

当 Claude Code 首次推出时，我们意识到模型需要一个 Todo 列表来保持跟踪。Todo 可以在开始时写入，并在模型工作时勾选。为了做到这一点，我们给了 Claude TodoWrite 工具，它可以写入或更新 Todo 并展示给用户。

但即使如此，我们经常看到 Claude 忘记它需要做什么。为了适应，我们每隔 5 轮插入系统提醒，提醒 Claude 它的目标。

但随着模型的改进，它们不仅不需要被提醒 Todo 列表，而且可能觉得它有限制。被发送 Todo 列表的提醒让 Claude 认为它必须坚持列表而不是修改它。我们还看到 Opus 4.5 在使用 subagents 方面做得更好，但 subagents 如何在共享 Todo 列表上协调？

看到这一点，我们用 Task 工具替换了 TodoWrite。Todo 是关于让模型保持跟踪，Task 更多是帮助 agents 相互通信。Task 可以包括依赖项，在 subagents 之间共享更新，模型可以修改和删除它们。

> **随着模型能力的增长，你的模型曾经需要的工具现在可能正在限制它们。** 不断回顾对需要什么工具的先前假设是很重要的。这也是为什么坚持支持一小套具有相当相似能力配置文件的模型很有用。

---

## 设计搜索界面

对 Claude 特别重要的一组工具是可用于构建其自身上下文的搜索工具。

当 Claude Code 刚推出时，我们使用 RAG 向量数据库为 Claude 找到上下文。虽然 RAG 强大且快速，但它需要索引和设置，并且在许多不同的环境中可能很脆弱。更重要的是，Claude 是被给予这个上下文，而不是自己找到上下文。

但如果 Claude 可以在网上搜索，为什么不能搜索你的代码库？通过给 Claude 一个 Grep 工具，我们可以让它搜索文件并自己构建上下文。

这是我们看到的随着 Claude 变得更聪明而出现的模式：如果给它正确的工具，它在构建自己的上下文方面会变得越来越好。

当我们引入 Agent Skills 时，我们正式化了**渐进式披露（Progressive Disclosure）** 的想法，这允许 agents 通过探索增量发现相关上下文。

Claude 可以读取 skill 文件，而这些文件可以引用其他文件，模型可以递归读取。实际上，skills 的一个常见用例是给 Claude 添加更多搜索能力，比如如何调用 API 或查询数据库。

在一年多的时间里，Claude 从不太能够构建自己的上下文，到能够在多层文件中进行嵌套搜索，找到它需要的确切上下文。

渐进式披露现在是我们用来添加新功能而不添加工具的常见技术。

---

## 渐进式披露：Claude Code Guide Agent

Claude Code 目前有大约 20 个工具，我们不断问自己是否需要所有这些。添加工具的门槛很高，因为这给模型多了一个要考虑的选择。

例如，我们注意到 Claude 不太了解如何使用 Claude Code。如果你问它如何添加 MCP 或什么是斜杠命令，它无法回答。

我们本可以把所有这些信息放在系统提示中，但考虑到用户很少问这个，它会增加上下文腐化，并干扰 Claude Code 的主要工作：写代码。

相反，我们尝试了一种渐进式披露的形式。我们给 Claude 一个文档链接，然后它可以加载来搜索更多信息。这有效了，但我们发现 Claude 会加载很多结果到上下文中来找到正确的答案，而实际上你只需要答案。

所以我们构建了 Claude Code Guide subagent，当你会问关于它自己的问题时，Claude 会被提示调用这个 subagent。这个 subagent 有详细的指令，告诉我们如何很好地搜索文档以及返回什么。

虽然这并不完美，当你问它如何设置自己时，Claude 仍然可能变得困惑，但它比过去好多了！我们能够在不添加工具的情况下为 Claude 的动作空间添加东西。

---

## 一门艺术，而非科学

如果你希望有一套关于如何构建工具的严格规则，遗憾的是这不是本指南。为你的模型设计工具既是艺术也是科学。它很大程度上取决于你正在使用的模型、Agent 的目标以及它运行的环境。

**经常实验，阅读你的输出，尝试新事物。像 Agent 一样看待事物。**

---

## 总结：Agent 工具设计原则

| 原则 | 描述 |
|------|------|
| **匹配 Agent 能力** | 工具应该符合 Agent 本身的能力水平 |
| **渐进式披露** | 不要把所有信息放在系统提示中，而是让 Agent 按需发现 |
| **随模型进化** | 曾经需要的工具可能变成限制，需要不断重新评估 |
| **关注实际使用** | 阅读 Agent 的输出，理解它如何调用工具 |
| **小而精的工具集** | 添加工具的门槛要高，给模型更少但更强的选择 |

---

## 参考资源

- [Lessons from Building Claude Code: Seeing like an Agent](https://x.com/trq212/status/1909886882662789170) - 原始 Twitter 线程
- [2.3：Agent Skills（智能体技能）入门](./chapter-2-3-agent-skills.md)
- [2.9：创建自定义命令](./chapter-2-9-custom-commands.md)
- [2.10：MCP 服务器扩展](./chapter-2-10-mcp-servers.md)