# Claude Code Hooks 参考指南

## 概述

Hooks 是用户定义的 Shell 命令或 LLM 提示词，在 Claude Code 生命周期的特定时间点自动执行。通过 Hooks 可以实现自动化工作流程、权限控制、代码验证等功能。

## Hook 生命周期

### 事件触发时机

| 事件 | 触发时机 |
|------|----------|
| `SessionStart` | 会话开始或恢复时 |
| `UserPromptSubmit` | 用户提交提示词，Claude 处理之前 |
| `PreToolUse` | 工具调用执行之前（可阻止） |
| `PermissionRequest` | 权限对话框出现时 |
| `PostToolUse` | 工具调用成功后 |
| `PostToolUseFailure` | 工具调用失败后 |
| `Notification` | Claude Code 发送通知时 |
| `SubagentStart` | 子代理被创建时 |
| `SubagentStop` | 子代理完成时 |
| `Stop` | Claude 完成响应时 |
| `PreCompact` | 上下文压缩之前 |
| `SessionEnd` | 会话终止时 |

## Hook 解析流程

以 `PreToolUse` hook 为例，展示完整的执行流程：

### 配置文件

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/block-rm.sh"
          }
        ]
      }
    ]
  }
}
```

### Hook 脚本

```bash
#!/bin/bash
# .claude/hooks/block-rm.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "危险命令被 hook 阻止"
    }
  }'
else
  exit 0  # 允许命令执行
fi
```

### 执行流程

1. Claude Code 决定执行 `Bash "rm -rf /tmp/build"`
2. 检查配置：发现 `PreToolUse` hook，matcher 为 `Bash`，匹配成功
3. 执行 hook 脚本，将 JSON 输入通过 stdin 传递
4. 脚本检测到 `rm -rf`，返回 `deny` 决策
5. Claude Code 拒绝执行该命令，显示拒绝原因

## 配置方式

| 位置 | 作用域 | 可共享 |
|------|--------|--------|
| `~/.claude/settings.json` | 所有项目 | 否（仅本地） |
| `.claude/settings.json` | 单个项目 | 是（可提交到仓库） |
| `.claude/settings.local.json` | 单个项目 | 否（git忽略） |
| 管理策略设置 | 组织级 | 是（管理员控制） |
| 插件 `hooks/hooks.json` | 插件启用时 | 是（插件捆绑） |
| Skill 或 agent frontmatter | 组件活动时 | 是（定义在组件文件中） |

### 基本配置结构

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/block-rm.sh"
          }
        ]
      }
    ]
  }
}
```

### Matcher 模式

`matcher` 字段使用正则表达式过滤 hooks 触发时机：

| 事件 | 过滤字段 | 示例匹配值 |
|------|----------|------------|
| `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest` | 工具名称 | `Bash`, `Edit\|Write`, `mcp__.*` |
| `SessionStart` | 会话启动方式 | `startup`, `resume`, `clear`, `compact` |
| `SessionEnd` | 会话结束原因 | `clear`, `logout`, `prompt_input_exit`, `other` |
| `Notification` | 通知类型 | `permission_prompt`, `idle_prompt`, `auth_success` |
| `SubagentStart` | 代理类型 | `Bash`, `Explore`, `Plan` |
| `PreCompact` | 压缩触发方式 | `manual`, `auto` |
| `SubagentStop` | 代理类型 | 同 `SubagentStart` |
| `UserPromptSubmit`, `Stop` | 无 matcher 支持 | 每次都触发 |

#### SessionStart 匹配值

| Matcher | 触发时机 |
|---------|----------|
| `startup` | 新会话启动 |
| `resume` | 使用 `--resume`、`--continue` 或 `/resume` |
| `clear` | 执行 `/clear` 命令后 |
| `compact` | 自动或手动压缩后 |

#### SessionEnd 匹配值

| Matcher | 描述 |
|---------|------|
| `clear` | 会话被 `/clear` 清除 |
| `logout` | 用户登出 |
| `prompt_input_exit` | 用户在提示输入时退出 |
| `bypass_permissions_disabled` | 绕过权限模式被禁用 |
| `other` | 其他退出原因 |

#### PreCompact 匹配值

| Matcher | 触发时机 |
|---------|----------|
| `manual` | 用户执行 `/compact` |
| `auto` | 上下文窗口满时自动压缩 |

#### Notification 匹配值

`Notification` 事件支持以下匹配值：

| Matcher | 描述 |
|---------|------|
| `permission_prompt` | Claude 需要权限批准时 |
| `idle_prompt` | Claude 空闲提示时 |
| `auth_success` | 认证成功通知 |
| `elicitation_dialog` | 诱骗对话框 |

#### MCP 工具匹配

MCP 工具遵循命名模式 `mcp__<server>__<tool>`：

- `mcp__memory__create_entities` - Memory 服务器的创建实体工具
- `mcp__filesystem__read_file` - Filesystem 服务器的读取文件工具

示例：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Memory operation' >> ~/mcp-operations.log"
          }
        ]
      }
    ]
  }
}
```

## Hook 处理器类型

### 1. Command Hooks（命令钩子）

执行 Shell 命令，脚本通过退出码和标准输出与 Claude Code 通信。

```json
{
  "type": "command",
  "command": "/path/to/script.sh",
  "timeout": 600,
  "async": false,
  "statusMessage": "自定义提示信息"
}
```

**字段说明：**
- `type`: 必须为 `"command"`
- `command`: 要执行的 Shell 命令
- `timeout`: 超时时间（秒），默认 600
- `async`: 是否后台运行，默认 false
- `statusMessage`: 自定义加载消息
- `once`: 是否仅运行一次（仅限 Skills）

### 2. Prompt Hooks（提示词钩子）

向 Claude 模型发送提示词进行单轮评估。

```json
{
  "type": "prompt",
  "prompt": "评估是否应该停止: $ARGUMENTS",
  "model": "haiku",
  "timeout": 30
}
```

**字段说明：**
- `type`: 必须为 `"prompt"`
- `prompt`: 发送给模型的提示词，`$ARGUMENTS` 会被替换为 hook 的 JSON 输入
- `model`: 使用的模型，默认快速模型
- `timeout`: 超时时间（秒），默认 30

**响应格式：**
```json
{
  "ok": true | false,
  "reason": "决策解释"
}
```

### 3. Agent Hooks（代理钩子）

生成子代理，可使用 Read、Grep、Glob 等工具验证条件。

```json
{
  "type": "agent",
  "prompt": "验证所有单元测试通过。运行测试套件并检查结果。$ARGUMENTS",
  "model": "sonnet",
  "timeout": 60
}
```

## Hook 输入与输出

### 通用输入字段

所有 hook 事件都接收这些字段：

| 字段 | 描述 |
|------|------|
| `session_id` | 当前会话标识符 |
| `transcript_path` | 对话 JSON 路径 |
| `cwd` | hook 调用时的当前工作目录 |
| `permission_mode` | 当前权限模式 |
| `hook_event_name` | 触发的事件名称 |

### 退出码控制

| 退出码 | 含义 | 效果 |
|--------|------|------|
| 0 | 成功 | 解析 stdout 的 JSON 输出 |
| 2 | 阻止错误 | stderr 作为错误消息反馈 |
| 其他 | 非阻止错误 | stderr 在详细模式显示 |

**退出码 2 在各事件中的行为：**

| Hook 事件 | 可否阻止 | 退出码 2 的效果 |
|-----------|----------|-----------------|
| `PreToolUse` | 是 | 阻止工具调用 |
| `PermissionRequest` | 是 | 拒绝权限请求 |
| `UserPromptSubmit` | 是 | 阻止提示词处理并清除 |
| `Stop` | 是 | 阻止 Claude 停止，继续对话 |
| `SubagentStop` | 是 | 阻止子代理停止 |
| `PostToolUse` | 否 | 将 stderr 显示给 Claude（工具已执行） |
| `PostToolUseFailure` | 否 | 将 stderr 显示给 Claude（工具已失败） |
| `Notification` | 否 | 仅向用户显示 stderr |
| `SubagentStart` | 否 | 仅向用户显示 stderr |
| `SessionStart` | 否 | 仅向用户显示 stderr |
| `SessionEnd` | 否 | 仅向用户显示 stderr |
| `PreCompact` | 否 | 仅向用户显示 stderr |

### JSON 输出字段

| 字段 | 默认值 | 描述 |
|------|--------|------|
| `continue` | `true` | 设为 `false` 完全停止处理 |
| `stopReason` | 无 | 停止时显示给用户的消息 |
| `suppressOutput` | `false` | 隐藏详细模式输出 |
| `systemMessage` | 无 | 显示给用户的警告消息 |

## 决策控制

不同事件使用不同的决策模式：

| 事件 | 决策模式 | 关键字段 |
|------|----------|----------|
| UserPromptSubmit, PostToolUse, PostToolUseFailure, Stop, SubagentStop | 顶层 `decision` | `decision: "block"`, `reason` |
| PreToolUse | `hookSpecificOutput` | `permissionDecision` (allow/deny/ask) |
| PermissionRequest | `hookSpecificOutput` | `decision.behavior` (allow/deny) |

### PermissionRequest 决策示例

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedInput": {
        "command": "npm run lint"
      },
      "updatedPermissions": [
        {
          "type": "toolAlwaysAllow",
          "tool": "Bash"
        }
      ]
    }
  }
}
```

**字段说明：**
- `behavior`: `"allow"` 授予权限，`"deny"` 拒绝权限
- `updatedInput`: 修改工具输入参数（仅 `allow` 时）
- `updatedPermissions`: 应用权限规则更新，相当于用户选择"始终允许"
- `message`: 告知 Claude 权限被拒绝的原因（仅 `deny` 时）
- `interrupt`: 是否停止 Claude（仅 `deny` 时）

### PreToolUse 决策示例

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "允许此操作",
    "updatedInput": {
      "command": "npm run lint"
    },
    "additionalContext": "当前环境: production，请谨慎操作"
  }
}
```

**permissionDecision 可选值：**
- `"allow"` - 绕过权限系统，直接执行
- `"deny"` - 阻止工具调用
- `"ask"` - 提示用户确认

### UserPromptSubmit 决策示例

```json
{
  "decision": "block",
  "reason": "测试套件必须通过才能继续"
}
```

## 主要事件详解

### SessionStart

**输入字段：**
- `source`: `"startup"`, `"resume"`, `"clear"`, `"compact"`
- `model`: 模型标识符
- `agent_type`: 代理类型（可选）

**决策控制：**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "额外的上下文信息"
  }
}
```

**环境变量持久化：**
```bash
#!/bin/bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG_LOG=true' >> "$CLAUDE_ENV_FILE"
fi
exit 0
```

### PreToolUse

**支持的工具：**
- Bash: `command`, `description`, `timeout`, `run_in_background`
- Write: `file_path`, `content`
- Edit: `file_path`, `old_string`, `new_string`, `replace_all`
- Read: `file_path`, `offset`, `limit`
- Glob: `pattern`, `path`
- Grep: `pattern`, `path`, `glob`, `output_mode`, `-i`, `multiline`
- WebFetch: `url`, `prompt`
- WebSearch: `query`, `allowed_domains`, `blocked_domains`
- Task: `prompt`, `description`, `subagent_type`, `model`

### PostToolUse / PostToolUseFailure

**输入包含：**
- `tool_input`: 工具参数
- `tool_response`: 工具结果（PostToolUse）
- `error`: 错误信息（PostToolUseFailure）
- `is_interrupt`: 是否用户中断
- `tool_use_id`: 工具调用唯一标识符

**PostToolUse 决策控制：**
```json
{
  "decision": "block",
  "reason": "测试未通过，不应继续",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "额外上下文信息",
    "updatedMCPToolOutput": "替换 MCP 工具的输出"
  }
}
```

**PostToolUseFailure 决策控制：**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUseFailure",
    "additionalContext": "失败后的补充上下文，帮助 Claude 理解问题"
  }
}
```

### Notification

**输入字段：**
- `message`: 通知文本内容
- `title`: 通知标题（可选）
- `notification_type`: 通知类型（`permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`）

**配置示例：**
```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/permission-alert.sh"
          }
        ]
      },
      {
        "matcher": "idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/idle-notification.sh"
          }
        ]
      }
    ]
  }
}
```

**决策控制：**
Notification hooks 不能阻止或修改通知，但可以返回：
```json
{
  "hookSpecificOutput": {
    "hookEventName": "Notification",
    "additionalContext": "添加到对话的上下文信息"
  }
}
```

### SubagentStart

**输入字段：**
- `agent_id`: 子代理的唯一标识符
- `agent_type`: 代理类型（`Bash`, `Explore`, `Plan`, 或自定义代理名称）

**决策控制：**
SubagentStart hooks 不能阻止子代理创建，但可以注入上下文：
```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "请遵循安全准则执行此任务"
  }
}
```

### SubagentStop

**输入字段：**
- `agent_id`: 子代理的唯一标识符
- `agent_type`: 代理类型
- `stop_hook_active`: 是否已因 hook 继续运行
- `agent_transcript_path`: 子代理的转录路径
- `transcript_path`: 主会话的转录路径

**决策控制：**
与 Stop hooks 使用相同的决策格式：
```json
{
  "decision": "block",
  "reason": "子代理必须完成任务才能停止"
}
```

### SessionEnd

**输入字段：**
- `reason`: 会话结束原因（见上面的匹配值表）

**决策控制：**
SessionEnd hooks 无法阻止会话终止，但可以执行清理任务，如记录日志或保存状态。

### PreCompact

**输入字段：**
- `trigger`: 触发类型（`manual` 或 `auto`）
- `custom_instructions`: 自定义压缩指令

**决策控制：**
PreCompact hooks 无法阻止压缩，但可以返回上下文信息。

### Stop / SubagentStop

**输入字段：**
- `stop_hook_active`: 是否已因 hook 继续运行（防止无限循环）

**决策控制：**
```json
{
  "decision": "block",
  "reason": "必须完成所有任务才能停止"
}
```

**注意**: Subagent 的 `Stop` hook 会自动转换为 `SubagentStop` 事件。

**防止无限循环示例：**
```bash
#!/bin/bash
# 检查是否已经因为 hook 而继续运行
STOP_HOOK_ACTIVE=$(jq -r '.stop_hook_active // false')

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  # 避免无限循环，允许停止
  exit 0
fi

# 检查是否有未完成的任务
TASKS_PENDING=$(jq -r '.transcript_path' | xargs -I {} cat {} | grep -c "TODO\|FIXME" || echo 0)

if [ "$TASKS_PENDING" -gt 0 ]; then
  echo '{"decision": "block", "reason": "仍有未完成的 TODO 项"}'
else
  exit 0
fi
```

## 后台 Hooks

长任务可使用 `async: true` 在后台运行：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/run-tests.sh",
            "async": true,
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

**限制：**
- 仅 `type: "command"` 支持 `async`
- 无法阻止或控制行为
- 输出在下一轮对话传递

## 路径引用

### 项目脚本

```json
{
  "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-style.sh"
}
```

### 插件脚本

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
}
```

## 安全最佳实践

1. **验证和清理输入** - 不要盲目信任输入数据
2. **始终引用变量** - 使用 `"$VAR"` 而非 `$VAR`
3. **阻止路径遍历** - 检查文件路径中的 `..`
4. **使用绝对路径** - 为脚本指定完整路径
5. **跳过敏感文件** - 避免处理 `.env`, `.git/`, 密钥等

## 技巧与调试

### 调试模式

```bash
claude --debug
```

显示 hook 执行详情，包括匹配的 hooks、退出码和输出。

### 详细模式

使用 `Ctrl+O` 切换详细模式，查看 hook 进度。

### 禁用 Hooks

- 临时禁用：`"disableAllHooks": true`
- 删除 hook：从配置中移除或使用 `/hooks` 菜单
- 外部修改会被警告，需在 `/hooks` 菜单中审查

### /hooks 交互式管理器

输入 `/hooks` 命令可打开交互式 hooks 管理器，无需直接编辑配置文件即可查看、添加和删除 hooks。

每个 hook 都有前缀标签指示其来源：
- `[User]`: 来自 `~/.claude/settings.json`
- `[Project]`: 来自 `.claude/settings.json`
- `[Local]`: 来自 `.claude/settings.local.json`
- `[Plugin]`: 来自插件的 `hooks/hooks.json`（只读）

### Hooks in Skills

在技能 frontmatter 中定义：

```yaml
---
name: secure-operations
description: 执行安全检查的操作
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

## 实用示例

### 阻止危险命令

```bash
#!/bin/bash
# .claude/hooks/block-dangerous.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "危险命令被 hook 阻止"
    }
  }'
else
  exit 0
fi
```

### 文件修改后运行测试（同步）

```bash
#!/bin/bash
# .claude/hooks/run-tests.sh
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.js ]]; then
  exit 0
fi

RESULT=$(npm test 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "{\"systemMessage\": \"测试通过\"}"
else
  echo "{\"systemMessage\": \"测试失败: $RESULT\"}"
fi
```

### 文件修改后异步运行测试

后台执行测试，Claude 继续工作：

```bash
#!/bin/bash
# .claude/hooks/run-tests-async.sh

# 从 stdin 读取 hook 输入
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 仅对源文件运行测试
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.js ]]; then
  exit 0
fi

# 运行测试并通过 systemMessage 报告结果
RESULT=$(npm test 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "{\"systemMessage\": \"编辑 $FILE_PATH 后测试通过\"}"
else
  echo "{\"systemMessage\": \"编辑 $FILE_PATH 后测试失败: $RESULT\"}"
fi
```

配置：
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/run-tests-async.sh",
            "async": true,
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

### 在 Stop 前验证测试

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "验证所有单元测试通过。运行测试套件。$ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

## 参考资源

- [Claude Code 官方文档](https://code.claude.com/docs/en/hooks)
- Hook 配置指南
- 限制与故障排除
- Bash 命令验证器参考实现

## 常见问题与故障排除

### JSON 解析失败

**症状**: Hook 输出 "JSON validation failed" 错误

**原因**: Shell 配置文件在启动时打印文本，干扰了 JSON 解析

**解决方案**: 确保 hook 脚本的 stdout 只包含 JSON 对象。可以在脚本开头添加：
```bash
#!/bin/bash
# 确保干净的输出
exec 2>/dev/null  # 临时禁用 stderr（可选）
```

### Hooks 未触发

**症状**: 配置的 hook 没有执行

**可能原因**:
1. Matcher 模式不正确
2. 配置文件路径错误
3. Hook 在会话开始后被外部修改

**解决方案**:
- 使用 `claude --debug` 查看匹配详情
- 检查 matcher 正则表达式是否正确
- 外部修改后使用 `/hooks` 菜单审查并应用更改

### Stop Hook 无限循环

**症状**: Claude 因 Stop hook 持续运行永不停止

**原因**: Stop hook 一直返回 `decision: "block"`

**解决方案**: 检查 `stop_hook_active` 字段，防止无限循环：
```bash
if [ "$(jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # 已经因为 hook 继续运行，允许停止
fi
```

### Hook 超时

**症状**: Hook 执行时间过长被中断

**解决方案**: 增加 `timeout` 值或优化脚本性能
```json
{
  "type": "command",
  "command": "/path/to/script.sh",
  "timeout": 1200  // 20 分钟
}
```

### MCP 工具匹配不生效

**症状**: MCP 工具的 hook 没有触发

**解决方案**: 确保使用正确的命名格式 `mcp__<server>__<tool>`：
```json
{
  "matcher": "mcp__memory__.*"  // 匹配 memory 服务器的所有工具
}
```
