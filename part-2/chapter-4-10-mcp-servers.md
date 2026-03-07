# 2.10: MCP 服务器扩展

你可以通过添加 MCP（Model Context Protocol，模型上下文协议）服务器来扩展 Claude Code 的能力。这些服务器可以在远程或本地机器上运行，为 Claude 提供它原本不具备的新工具和能力。

最流行的 MCP 服务器之一是 Playwright，它让 Claude 能够控制网络浏览器。这为 Web 开发工作流开辟了强大的可能性。

## 安装 Playwright MCP 服务器

要将 Playwright 服务器添加到 Claude Code，请在终端中运行以下命令（不在 Claude Code 内部）：

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

这个命令做了两件事：

1. 将 MCP 服务器命名为 "playwright"
2. 提供在你的机器上本地启动服务器的命令

## 管理权限

当你第一次使用 MCP 服务器工具时，Claude 每次都会请求权限。如果你厌倦了这些权限提示，可以通过编辑设置来预先批准服务器。

打开 `.claude/settings.local.json` 文件并将服务器添加到 allow 数组中：

```json
{
  "permissions": {
    "allow": ["mcp__playwright"],
    "deny": []
  }
}
```

注意 `mcp__playwright` 中的双下划线。这允许 Claude 使用 Playwright 工具而无需每次都请求权限。

## 实际示例：改进组件生成

以下是 Playwright MCP 服务器如何改善你的开发工作流的实际示例。不同于手动测试和调整提示词，你可以让 Claude：

1. 打开浏览器并导航到你的应用程序
2. 生成一个测试组件
3. 分析视觉样式和代码质量
4. 根据观察结果更新生成提示词
5. 使用新组件测试改进后的提示词

例如，你可能会要求 Claude：

> "导航到 localhost:3000，生成一个基础组件，检查样式，并更新 @src/lib/prompts/generation.tsx 处的生成提示词，以便将来生成更好的组件。"

Claude 将使用浏览器工具与你的应用交互，检查生成的输出，然后修改你的提示词文件以鼓励更有创意和原创性的设计。

## 结果与收益

在实践中，这种方法可以带来显著更好的结果。不同于通用的紫到蓝渐变和标准的 Tailwind 模式，Claude 可能会更新提示词以鼓励：

- 温暖的日落渐变（橙到粉到紫）
- 海洋深度主题（青到翠到青）
- 不对称设计和重叠元素
- 创意间距和非传统布局

关键优势在于 Claude 可以看到实际的视觉输出，而不仅仅是代码，这让它能够做出更明智的样式改进决策。

## 探索其他 MCP 服务器

Playwright 只是 MCP 服务器可能性的一个例子。生态系统包括用于以下功能的服务器：

- 数据库交互
- API 测试和监控
- 文件系统操作
- 云服务集成
- 开发工具自动化

考虑探索与你的特定开发需求相契合的 MCP 服务器。它们可以将 Claude 从代码助手转变为可以与你的整个工具链交互的综合开发伙伴。
