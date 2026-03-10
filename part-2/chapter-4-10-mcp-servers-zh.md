---
id: "part-2-chapter-4-10-mcp-servers-zh"
title: "2.10: MCP 服务器扩展"
slug: "part-2-chapter-4-10-mcp-servers-zh"
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
display_order: 29
---
# 2.10: MCP 服务器扩展

`2.1 > 2.2 > 2.3 > 2.4 > 2.5 > 2.6 > 2.7 > 2.8 > 2.9 | [ 2.10 ] 2.11`

> *"MCP 让 Claude 从代码助手进化为全栈伙伴"* -- 通过协议扩展，解锁无限可能。

## 问题

Claude Code 开箱即用的能力受限于内置工具集（Bash、Read、Write、Edit）。在以下场景中，这些工具显得力不从心：

- **Web 开发调试**：需要手动查看源码、猜测样式问题，无法直观看到渲染效果
- **数据库操作**：需要编写 SQL 查询脚本，无法直接交互式探索数据
- **API 测试**：需要借助外部工具（curl、Postman），上下文频繁切换
- **浏览器自动化**：需要编写 Selenium/Playwright 脚本，门槛高、调试难

本质上，Claude 与外部世界的交互受限于"文件+命令"的抽象层。 MCP（Model Context Protocol） 的出现，为 Claude 提供了标准化的能力扩展协议。

## 解决方案

```
+-------------------+      +-------------------+      +-------------------+
|   Claude Code      |      |   MCP Server      |      |   External        |
|   (Host)          |<----->|   (Playwright)   |<----->|   Resources      |
|                   |      |                   |      |   - Browser        |
|  Tool: mcp__*     |      |  Tools:           |      |   - Database       |
|  - browser_goto   |      |  - browser_goto   |      |   - API endpoints  |
|  - browser_click  |      |  - browser_click  |      |   - Files          |
|  - browser_type   |      |  - browser_type   |      |                   |
+-------------------+      +-------------------+      +-------------------+
         ^
         |
    标准化协议 (MCP)
    - 工具发现
    - 参数校验
    - 结果返回
```

MCP 的核心价值：

| 特性 | 说明 | 收益 |
|------|------|------|
| 协议标准化 | 统一的服务发现、调用、返回格式 | 一次接入，处处可用 |
| 能力可扩展 | 通过添加服务器解锁新能力 | 从"能做什么"到"想做什么" |
| 安全可控 | 每个工具单独授权，可预批准 | 企业级安全合规 |
| 生态共享 | 社区贡献的服务器可复用 | 避免重复造轮子 |

## 工作原理

### 1. MCP 架构概览

MCP 采用客户端-服务器架构：

```
┌─────────────────────────────────────────────────────────┐
│                      Host (Claude Code)                  │
│  ┌─────────────────────────────────────────────────┐     │
│  │              MCP Client (内置)                  │     │
│  │  - 服务发现 (Tools/List)                        │     │
│  │  - 工具调用 (Tools/Call)                        │     │
│  │  - 会话管理                                     │     │
│  └────────────────┬────────────────────────────────┘     │
│                   │ MCP Protocol (stdio/sse)             │
└───────────────────┼──────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼─────┐           ┌──────▼─────┐
   │ Playwright│           │  Database  │
   │ Server    │           │  Server    │
   └───────────┘           └────────────┘
```

### 2. 服务器安装与配置

以 Playwright MCP 服务器为例：

**步骤 1: 安装服务器**

```bash
# 在终端中运行（不在 Claude Code 内部）
claude mcp add playwright npx @playwright/mcp@latest
```

这个命令：
1. 将 MCP 服务器命名为 "playwright"
2. 指定服务器启动命令

**步骤 2: 配置权限（可选但推荐）**

首次使用 MCP 服务器工具时，Claude 会请求权限。可通过配置文件预批准：

```json
// .claude/settings.local.json
{
  "permissions": {
    "allow": ["mcp__playwright"],
    "deny": []
  }
}
```

**步骤 3: 重启 Claude Code**

配置更改后，必须重启 Claude Code 以加载新命令。

### 3. 工具调用流程

当 Claude 需要使用 MCP 工具时，遵循以下流程：

```python
# 1. 工具发现（启动时或按需）
available_tools = mcp_client.list_tools(server="playwright")
# 返回: [browser_goto, browser_click, browser_type, browser_screenshot, ...]

# 2. 工具调用
result = mcp_client.call_tool(
    server="playwright",
    tool="browser_goto",
    arguments={"url": "http://localhost:3000"}
)

# 3. 结果处理
if result.success:
    # 将结果注入对话上下文
    messages.append({
        "role": "user",
        "content": f"浏览器页面内容: {result.content}"
    })
else:
    # 错误处理
    messages.append({
        "role": "user",
        "content": f"工具调用错误: {result.error}"
    })
```

### 4. 实际应用示例

#### 示例：浏览器驱动的组件开发

```markdown
# 开发场景：改进 React 组件

## 用户 Prompt
"导航到 localhost:3000，生成一个卡片组件，
检查渲染效果，并更新生成提示词以便将来生成更好的组件"

## Claude 执行流程

### Step 1: 导航到应用
工具: mcp__playwright__browser_goto
参数: { "url": "http://localhost:3000" }
结果: 页面加载成功，当前为应用首页

### Step 2: 生成组件
工具: Write
文件: src/components/Card.tsx
内容: (生成的 React 组件代码)

### Step 3: 检查渲染效果
工具: mcp__playwright__browser_screenshot
参数: { "selector": "[data-testid='card-component']" }
结果: (返回截图数据)

分析：
- 颜色使用标准 Tailwind 渐变（缺乏创意）
- 间距遵循标准模式（过于保守）
- 布局对称（可尝试不对称设计）

### Step 4: 更新提示词文件
工具: Read + Edit
文件: src/lib/prompts/generation.tsx

新增内容：
```
组件设计指南：
- 尝试温暖的日落渐变（橙到粉到紫）
- 探索海洋深度主题（青到翠到青）
- 使用不对称设计和重叠元素
- 尝试创意间距和非传统布局
```

### Step 5: 验证改进
工具: mcp__playwright__browser_reload
结果: 页面重新加载，提示词已生效

## 成果

关键优势：Claude 可以看到实际的视觉输出，而不仅仅是代码，这让它能够做出更明智的样式改进决策。
```

## 探索其他 MCP 服务器

Playwright 只是 MCP 服务器可能性的一个例子。生态系统包括用于以下功能的服务器：

- **数据库交互** - 直接查询和可视化数据
- **API 测试和监控** - 自动化 API 验证
- **文件系统操作** - 高级文件管理
- **云服务集成** - 与 AWS、GCP、Azure 交互
- **开发工具自动化** - 与 IDE、CI/CD 集成

考虑探索与你的特定开发需求相契合的 MCP 服务器。它们可以将 Claude 从代码助手转变为可以与你的整个工具链交互的综合开发伙伴。

## 变更对比

| 组件 | 之前 | 之后 (2.10) |
|------|------|-------------|
| 工具集 | 内置 4 个基础工具 | 通过 MCP 无限扩展 |
| Web 调试 | 手动查看源码猜测 | 浏览器可视化检查 |
| 数据库操作 | 编写 SQL 脚本 | MCP 直接交互 |
| API 测试 | 外部工具切换 | Claude 内完成 |
| 能力边界 | 固定 | 可动态扩展 |

## 最佳实践

### MCP 服务器选择指南

| 场景 | 推荐 MCP 服务器 | 关键工具 |
|------|----------------|----------|
| Web 开发 | Playwright | browser_goto, screenshot, click |
| 数据库 | SQLite/PostgreSQL | query, schema, visualize |
| API 开发 | HTTP/REST | request, mock, validate |
| 云开发 | AWS/GCP/Azure | deploy, monitor, configure |

### 安全使用建议

1. **权限最小化**：仅预批准必要的服务器
   ```json
   {
     "permissions": {
       "allow": ["mcp__playwright"],
       "deny": ["mcp__filesystem_delete"]
     }
   }
   ```

2. **审查服务器来源**：优先使用官方或社区验证的服务器

3. **敏感操作确认**：涉及生产环境的操作保留人工确认步骤

4. **定期审计**：检查 `.claude/settings.local.json` 中的权限配置

通过合理配置和使用 MCP 服务器，你可以将 Claude Code 从强大的代码助手升级为能够与整个开发工具链深度集成的综合开发伙伴。
