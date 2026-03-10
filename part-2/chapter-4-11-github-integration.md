# 5.11: GitHub 集成

Claude Code 提供官方的 GitHub 集成，允许 Claude 在 GitHub Actions 中运行。这项集成提供了两种主要工作流：问题和拉取请求的提及支持，以及自动拉取请求审查。

## 设置集成

要开始使用，在 Claude 中运行 `/install-github-app` 命令。这个命令将引导你完成设置过程：

1. 在 GitHub 上安装 Claude Code 应用
2. 添加你的 API 密钥
3. 自动生成包含工作流文件的拉取请求

生成的拉取请求会将 GitHub Actions 添加到你的仓库中。合并后，你将在 `.github/workflows` 目录中获得工作流文件。

## 默认 GitHub Actions

该集成提供两种主要工作流：

### 提及 Action

你可以在任何问题或拉取请求中通过 `@claude` 提及 Claude。当被提及时，Claude 将：

- 分析请求并创建任务计划
- 以完整访问你的代码库的方式执行任务
- 直接在问题或 PR 中回复结果

### 拉取请求 Action

每当你创建拉取请求时，Claude 会自动：

- 审查提议的更改
- 分析修改的影响
- 在拉取请求上发布详细报告

## 自定义工作流

合并初始拉取请求后，你可以自定义工作流文件以适应项目的需要。以下是增强提及工作流的方法：

### 添加项目设置

在 Claude 运行之前，你可以添加步骤来准备环境：

```yaml
- name: Project Setup
  run: |
    npm run setup
    npm run dev:daemon
```

### 自定义指令

向 Claude 提供有关项目设置的上下文：

```yaml
custom_instructions: |
  The project is already set up with all dependencies installed.
  The server is already running at localhost:3000. Logs from it
  are being written to logs.txt. If needed, you can query the
  db with the 'sqlite3' cli. If needed, use the mcp__playwright
  set of tools to launch a browser and interact with the app.
```

### MCP 服务器配置

你可以配置 MCP 服务器，为 Claude 提供额外的能力：

```yaml
mcp_config: |
  {
    "mcpServers": {
      "playwright": {
        "command": "npx",
        "args": [
          "@playwright/mcp@latest",
          "--allowed-origins",
          "localhost:3000;cdn.tailwindcss.com;esm.sh"
        ]
      }
    }
  }
```

### 工具权限

在 GitHub Actions 中运行 Claude 时，你必须明确列出所有允许的工具。在使用 MCP 服务器时，这一点尤为重要。

```yaml
allowed_tools: "Bash(npm:*),Bash(sqlite3:*),mcp__playwright__browser_snapshot,mcp__playwright__browser_click,..."
```

与本地开发不同，GitHub Actions 中没有权限的快捷方式。每个 MCP 服务器的每个工具都必须单独列出。

## 最佳实践

设置 Claude 的 GitHub 集成时：

- **从默认工作流开始，逐步自定义** - 不要一开始就尝试配置所有内容
- **使用自定义指令提供项目特定的上下文** - 帮助 Claude 理解你的项目结构
- **使用 MCP 服务器时明确工具权限** - 确保列出所有需要的工具
- **先用简单任务测试工作流** - 确保基本功能正常后再尝试复杂任务
- **根据项目特定需求配置额外步骤** - 如数据库设置、环境变量等

## 将 Claude 从开发助手转变为自动化团队成员

GitHub 集成将 Claude 从开发助手转变为可以处理任务、审查代码并直接在 GitHub 工作流中提供洞察的自动化团队成员。通过在 GitHub Actions 中运行 Claude，你可以：

- **自动化代码审查** - 每个 PR 自动获得详细审查
- **快速响应问题** - 通过 @claude 提及获得即时帮助
- **保持一致性** - 确保所有代码都经过 Claude 的分析
- **扩展团队能力** - 让 Claude 处理重复性审查任务

这种集成不仅仅是添加一个工具，而是将 AI 能力深度整合到你的开发工作流中，使 Claude 成为团队的正式成员。
