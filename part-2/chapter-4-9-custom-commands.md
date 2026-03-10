---
id: "part-2-chapter-4-9-custom-commands"
title: "5.9: 创建自定义命令"
slug: "part-2-chapter-4-9-custom-commands"
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
display_order: 45
---
# 5.9: 创建自定义命令

Claude Code 内置了可以通过斜杠访问的命令，但你也可以创建自己的自定义命令来自动化经常执行的重复性任务。

## 创建自定义命令

要创建自定义命令，你需要在项目中设置特定的文件夹结构：

1. 在项目目录中找到 `.claude` 文件夹
2. 在其中创建一个名为 `commands` 的新目录
3. 创建一个以你希望命名的命令为名称的 markdown 文件（如 `audit.md`）

文件名会成为你的命令名称——因此 `audit.md` 会创建 `/audit` 命令。

## 示例：审计命令

下面是一个自定义命令的实际示例，该命令审计项目依赖中的安全漏洞：

```markdown
---
name: audit
description: 运行 npm audit 检查并修复安全漏洞
tools: Bash
---

运行 npm audit 识别有漏洞的已安装包
运行 npm audit fix 应用更新
运行测试以验证更新没有破坏任何功能
```

这个审计命令做了三件事：

1. 运行 `npm audit` 查找有漏洞的已安装包
2. 运行 `npm audit fix` 应用更新
3. 运行测试以验证更新没有破坏任何功能

创建命令文件后，**必须重启 Claude Code** 才能识别新命令。

## 带参数的命令

自定义命令可以使用 `$ARGUMENTS` 占位符接受参数。这使它们更加灵活和可重用。

例如，一个 `write_tests.md` 命令可能包含：

```markdown
---
name: write_tests
description: 为指定文件编写全面的测试
tools: Read, Write
---

为以下内容编写全面的测试：$ARGUMENTS

测试约定：
* 使用 Vitests 配合 React Testing Library
* 将测试文件放在源文件所在文件夹的 __tests__ 目录中
* 将测试文件命名为 [filename].test.ts(x)
* 使用 @/ 前缀进行导入

覆盖率：
* 测试正常路径
* 测试边界情况
* 测试错误状态
```

然后你可以使用文件路径运行此命令：

```
/write_tests hooks 目录中的 use-auth.ts 文件
```

参数不一定是文件路径——它们可以是任何字符串，你想传递这些字符串来给 Claude 提供上下文和任务指导。

## 主要优势

- **自动化** — 将重复的工作流转化为单个命令
- **一致性** — 确保每次遵循相同的步骤
- **上下文** — 为你的项目向 Claude 提供特定的指令和约定
- **灵活性** — 使用参数使命令适用于不同的输入

自定义命令对于特定于项目的工作流特别有用，如运行测试套件、部署代码，或按照团队约定生成样板代码。
