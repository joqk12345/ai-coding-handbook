# 2.9: 创建自定义命令

`2.1 > 2.2 > 2.3 > 2.4 > 2.5 > 2.6 > 2.7 > 2.8 | [ 2.9 ] 2.10 > 2.11`

> *"将重复工作流固化为一个命令"* -- 自定义命令让团队规范成为可执行契约。

## 问题

在日常开发中，有许多高频重复任务：
- 运行测试套件并生成报告
- 按照团队规范提交代码
- 为特定文件生成样板代码
- 执行安全检查与依赖审计

每次执行这些任务时，都需要：
1. 回忆正确的执行步骤
2. 手动输入多行命令
3. 确保符合团队规范
4. 验证执行结果

这个过程不仅耗时，还容易因人为疏忽导致错误。

## 解决方案

```
+-------------------+      +-------------------+      +-------------------+
|   用户输入         |      |   自定义命令      |      |   自动化执行       |
|   /audit          | ---> |   解析与匹配       | ---> |   npm audit       |
|   /test-api       |      |   参数替换        |      |   报告生成         |
|   /deploy         |      |   工具调用        |      |   验证检查         |
+-------------------+      +-------------------+      +-------------------+
        ^                                                    |
        |                                                    v
        +---------------------------------------------- 结果反馈
```

自定义命令的本质：**将高频、重复、规范化的工作流，固化为可复用的命令入口**。

核心设计原则：

| 原则 | 说明 | 示例 |
|------|------|------|
| 单一入口 | 一个命令对应一个明确任务 | `/audit` 只处理安全审计 |
| 参数化 | 支持变量输入，增强复用性 | `/test $FILE` 测试指定文件 |
| 工具绑定 | 声明可调用工具，明确能力边界 | `tools: Read, Bash` |
| 文本即代码 | Markdown + FrontMatter 定义 | 版本控制友好 |

## 工作原理

### 1. 命令文件结构

自定义命令以 Markdown 文件形式存储，使用 FrontMatter 定义元数据：

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

**存储位置与生效范围：**

```
项目级（推荐）
├── .claude/
│   └── commands/           # 命令存储目录
│       ├── audit.md        # /audit 命令
│       ├── test-api.md     # /test-api 命令
│       └── deploy.md       # /deploy 命令
│
用户级（全局）
~/.claude/commands/         # 对本机所有项目生效
```

建议优先使用项目级命令，避免用户级命令误影响无关仓库。

### 2. 命令解析与匹配

当用户输入斜杠命令时，Claude 执行以下匹配逻辑：

```python
# 伪代码示意
class CommandManager:
    def __init__(self):
        self.commands = self._load_commands()

    def _load_commands(self):
        """从 .claude/commands/ 加载所有命令"""
        commands = {}
        for cmd_file in Path('.claude/commands').glob('*.md'):
            cmd = self._parse_command(cmd_file)
            commands[cmd['name']] = cmd
        return commands

    def execute(self, command_name, arguments=None):
        """执行匹配的命令"""
        if command_name not in self.commands:
            return f"Unknown command: {command_name}"

        cmd = self.commands[command_name]

        # 验证权限：检查命令声明的工具
        allowed_tools = cmd.get('tools', [])

        # 参数替换
        prompt = cmd['content']
        if arguments:
            prompt = prompt.replace('$ARGUMENTS', arguments)

        # 执行命令提示词
        return self._execute_with_tools(prompt, allowed_tools)
```

### 3. 参数化命令

自定义命令支持使用 `$ARGUMENTS` 占位符接受参数：

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

使用方法：

```
/write_tests hooks 目录中的 use-auth.ts 文件
```

### 4. 工具权限声明

命令通过 FrontMatter 的 `tools` 字段声明可调用工具，这是权限边界：

```markdown
---
name: deploy
description: 部署应用到生产环境
tools: Bash, Read, Write
---
```

工具权限类型：

| 工具类型 | 用途 | 示例 |
|---------|------|------|
| Bash | 执行命令 | `Bash(npm run build)` |
| Read | 读取文件 | `Read` |
| Write | 写入文件 | `Write` |
| Edit | 编辑文件 | `Edit` |

## 使用示例

### 示例 1: Git 提交规范命令

```markdown
---
name: commit
description: 按照团队规范执行 Git 提交
tools: Bash, Read
---

按照以下步骤执行提交：

1. 检查当前分支名是否符合规范 (feature|bugfix|hotfix)/JIRA-ID-描述
2. 执行 `git status` 查看变更文件
3. 执行 `git diff --cached` 查看暂存内容
4. 按照规范编写提交信息：
   - 类型: 描述 (50字符以内)
   - 空行
   - 详细说明（可选）
5. 执行 `git commit`
6. 如果是功能分支，提示是否需要推送
```

### 示例 2: API 端点测试命令

```markdown
---
name: test-api
description: 测试指定的 API 端点
tools: Bash, Read
---

测试 API 端点：$ARGUMENTS

执行步骤：
1. 读取 API 文档或路由定义
2. 构造测试请求（包含必要的 headers、body）
3. 使用 curl 或 httpie 发送请求
4. 验证响应状态码和结构
5. 如失败，分析错误原因并提供修复建议

测试覆盖：
- 正常请求 (200 OK)
- 无效参数 (400 Bad Request)
- 未授权访问 (401 Unauthorized)
- 资源不存在 (404 Not Found)
```

### 示例 3: 代码审查命令

```markdown
---
name: review
description: 审查指定文件的代码质量
tools: Read
---

审查以下内容的代码质量：$ARGUMENTS

审查清单：
□ 代码可读性（命名、注释、结构）
□ 潜在 bug（空指针、资源泄漏、竞态条件）
□ 性能问题（不必要的循环、低效算法）
□ 安全漏洞（注入、XSS、敏感信息暴露）
□ 测试覆盖（边界情况、错误路径）
□ 符合项目规范（风格、架构模式）

输出格式：
- 严重问题（必须修复）
- 改进建议（推荐修复）
- 正面反馈（做得好的地方）
```

## 变更对比

| 组件 | 之前 | 之后 (2.9) |
|------|------|-----------|
| 重复任务执行 | 手动输入多行命令 | 单条 `/command` 执行 |
| 团队规范 | 口头/文档传达 | 固化为可执行命令 |
| 权限控制 | 无明确边界 | FrontMatter 声明工具权限 |
| 参数化 | 硬编码 | `$ARGUMENTS` 变量替换 |
| 可维护性 | 分散在脚本中 | 集中管理，版本控制友好 |

## 最佳实践

### 命令设计原则

1. **单一职责**：一个命令只做一件事
   ```markdown
   # 好
   /deploy - 只处理部署

   # 不好
   /deploy-and-test - 职责混杂
   ```

2. **明确描述**：描述中包含触发条件和预期行为
   ```markdown
   description: 当需要验证API端点时，测试指定的接口并返回状态报告
   ```

3. **最小权限**：只声明必要的工具
   ```markdown
   # 好
   tools: Read, Bash(npm:*)

   # 不好（过度授权）
   tools: Read, Write, Edit, Bash
   ```

4. **参数验证**：对 $ARGUMENTS 进行有效性检查
   ```markdown
   执行步骤：
   1. 验证 $ARGUMENTS 不为空
   2. 验证文件 $ARGUMENTS 存在
   3. 执行操作
   ```

### 命令组织建议

```
.claude/commands/
├── dev/                    # 开发相关
│   ├── start-dev.md
│   ├── run-tests.md
│   └── lint-fix.md
├── deploy/                 # 部署相关
│   ├── deploy-staging.md
│   └── deploy-prod.md
├── review/                 # 代码审查
│   ├── review-code.md
│   └── security-check.md
└── utils/                  # 通用工具
    ├── git-commit.md
    └── update-deps.md
```

通过合理设计和组织自定义命令，团队可以将最佳实践固化为可执行的标准，显著提升开发效率和代码质量的一致性。
