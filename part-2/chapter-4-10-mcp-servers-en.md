# 2.10: MCP Server Extensions

`2.1 > 2.2 > 2.3 > 2.4 > 2.5 > 2.6 > 2.7 > 2.8 > 2.9 | [ 2.10 ] 2.11`

> *"MCP transforms Claude from a coding assistant into a full-stack partner"* -- Through protocol extensions, unlock infinite possibilities.

## Problem

Claude Code's out-of-the-box capabilities are limited by its built-in toolset (Bash, Read, Write, Edit). In the following scenarios, these tools fall short:

- **Web Development Debugging**: Requires manually inspecting source code and guessing style issues, unable to visually see rendered results
- **Database Operations**: Requires writing SQL query scripts, cannot interactively explore data directly
- **API Testing**: Requires external tools (curl, Postman), frequent context switching
- **Browser Automation**: Requires writing Selenium/Playwright scripts, high barrier to entry, difficult debugging

Essentially, Claude's interaction with the external world is limited to the "files + commands" abstraction layer. The emergence of MCP (Model Context Protocol) provides Claude with a standardized capability extension protocol.

## Solution

```
+-------------------+      +-------------------+      +-------------------+
|   Claude Code      |      |   MCP Server      |      |   External        |
|   (Host)          |<---->|   (Playwright)   |<---->|   Resources      |
|                   |      |                   |      |   - Browser        |
|  Tool: mcp__*     |      |  Tools:           |      |   - Database       |
|  - browser_goto   |      |  - browser_goto   |      |   - API endpoints  |
|  - browser_click  |      |  - browser_click  |      |   - Files          |
|  - browser_type   |      |  - browser_type   |      |                   |
+-------------------+      +-------------------+      +-------------------+
         ^
         |
    Standardized Protocol (MCP)
    - Tool Discovery
    - Parameter Validation
    - Result Return
```

Core Value of MCP:

| Feature | Description | Benefit |
|---------|-------------|---------|
| Protocol Standardization | Unified service discovery, invocation, and return formats | Connect once, use everywhere |
| Capability Extensibility | Unlock new capabilities by adding servers | From "what can be done" to "what we want to do" |
| Security & Control | Individual authorization for each tool, pre-approval possible | Enterprise-grade security compliance |
| Ecosystem Sharing | Community-contributed servers can be reused | Avoid reinventing the wheel |

## How It Works

### 1. MCP Architecture Overview

MCP adopts a client-server architecture:

```
┌─────────────────────────────────────────────────────────┐
│                      Host (Claude Code)                  │
│  ┌─────────────────────────────────────────────────┐     │
│  │              MCP Client (Built-in)              │     │
│  │  - Service Discovery (Tools/List)             │     │
│  │  - Tool Invocation (Tools/Call)               │     │
│  │  - Session Management                         │     │
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

### 2. Server Installation and Configuration

Taking the Playwright MCP server as an example:

**Step 1: Install the Server**

```bash
# Run in terminal (not inside Claude Code)
claude mcp add playwright npx @playwright/mcp@latest
```

This command:
1. Names the MCP server "playwright"
2. Specifies the server startup command

**Step 2: Configure Permissions (Optional but Recommended)**

When using MCP server tools for the first time, Claude will request permission. This can be pre-approved through configuration files:

```json
// .claude/settings.local.json
{
  "permissions": {
    "allow": ["mcp__playwright"],
    "deny": []
  }
}
```

**Step 3: Restart Claude Code**

After configuration changes, Claude Code must be restarted to load the new commands.

### 3. Tool Invocation Flow

When Claude needs to use MCP tools, it follows this flow:

```python
# 1. Tool Discovery (at startup or on demand)
available_tools = mcp_client.list_tools(server="playwright")
# Returns: [browser_goto, browser_click, browser_type, browser_screenshot, ...]

# 2. Tool Invocation
result = mcp_client.call_tool(
    server="playwright",
    tool="browser_goto",
    arguments={"url": "http://localhost:3000"}
)

# 3. Result Processing
if result.success:
    # Inject result into conversation context
    messages.append({
        "role": "user",
        "content": f"Browser page content: {result.content}"
    })
else:
    # Error handling
    messages.append({
        "role": "user",
        "content": f"Tool invocation error: {result.error}"
    })
```

### 4. Practical Application Example

#### Example: Browser-Driven Component Development

```markdown
# Development Scenario: Improving React Component

## User Prompt
"Navigate to localhost:3000, generate a card component,
check the rendering effect, and update the generation prompt for better components in the future"

## Claude Execution Flow

### Step 1: Navigate to App
Tool: mcp__playwright__browser_goto
Args: { "url": "http://localhost:3000" }
Result: Page loaded successfully, currently on app homepage

### Step 2: Generate Component
Tool: Write
File: src/components/Card.tsx
Content: (Generated React component code)

### Step 3: Check Rendering Effect
Tool: mcp__playwright__browser_screenshot
Args: { "selector": "[data-testid='card-component']" }
Result: (Returns screenshot data)

Analysis:
- Color uses standard Tailwind gradient (lacks creativity)
- Spacing follows standard pattern (too conservative)
- Layout is symmetrical (could try asymmetrical design)

### Step 4: Update Prompt File
Tool: Read + Edit
File: src/lib/prompts/generation.tsx

Added Content:
```
Component Design Guidelines:
- Try warm sunset gradients (orange to pink to purple)
- Explore ocean depth themes (cyan to emerald to teal)
- Use asymmetrical designs with overlapping elements
- Experiment with creative spacing and non-traditional layouts
```

### Step 5: Verify Improvement
Tool: mcp__playwright__browser_reload
Result: Page reloaded, prompt is now active

## Outcome

Key advantage: Claude can see actual visual output, not just code, enabling more informed styling improvement decisions.
```

## Exploring Other MCP Servers

Playwright is just one example of MCP server possibilities. The ecosystem includes servers for:

- **Database Interactions** - Direct querying and data visualization
- **API Testing and Monitoring** - Automated API validation
- **File System Operations** - Advanced file management
- **Cloud Service Integration** - Interact with AWS, GCP, Azure
- **Development Tool Automation** - Integrate with IDEs, CI/CD

Consider exploring MCP servers that align with your specific development needs. They can transform Claude from a coding assistant into a comprehensive development partner that can interact with your entire toolchain.

## Change Comparison

| Component | Before | After (2.10) |
|-----------|--------|--------------|
| Tool Set | 4 built-in basic tools | Unlimited expansion via MCP |
| Web Debugging | Manual source inspection and guessing | Browser visual inspection |
| Database Operations | Writing SQL scripts | Direct MCP interaction |
| API Testing | External tool switching | Completed within Claude |
| Capability Boundary | Fixed | Dynamically extensible |

## Best Practices

### MCP Server Selection Guide

| Scenario | Recommended MCP Server | Key Tools |
|----------|------------------------|-----------|
| Web Development | Playwright | browser_goto, screenshot, click |
| Database | SQLite/PostgreSQL | query, schema, visualize |
| API Development | HTTP/REST | request, mock, validate |
| Cloud Development | AWS/GCP/Azure | deploy, monitor, configure |

### Secure Usage Recommendations

1. **Minimize Permissions**: Only pre-approve necessary servers
   ```json
   {
     "permissions": {
       "allow": ["mcp__playwright"],
       "deny": ["mcp__filesystem_delete"]
     }
   }
   ```

2. **Review Server Sources**: Prioritize official or community-verified servers

3. **Sensitive Operation Confirmation**: Retain human confirmation for production environment operations

4. **Regular Audits**: Check permission configurations in `.claude/settings.local.json`

By properly configuring and using MCP servers, you can transform Claude Code from a powerful coding assistant into a comprehensive development partner that can deeply integrate with your entire development toolchain.
