# 第2.5章：`claude-code-showcase` 配置拆解（.claude + README）

> 参考仓库：<https://github.com/ChrisWiles/claude-code-showcase>

这一章以 `ChrisWiles/claude-code-showcase` 为样本，重点看它如何用 `.claude/` 与 `README.md` 把 Claude Code 从“聊天助手”配置成“工程化协作系统”。

---

## 2.5.1 为什么这个 showcase 值得看

这个仓库的价值不在某一个技巧，而在“配置组合”：

- 用 `CLAUDE.md` 沉淀项目规则与上下文；
- 用 `.claude/settings.json` 配 Hook、权限与自动检查；
- 用 `.claude/skills/` 固化领域知识；
- 用 `.claude/commands/` 做高频流程一键化；
- 用 `.claude/agents/` 承载专职代理（如 code reviewer）；
- 用 `.mcp.json` 接入外部系统；
- 用 `.github/workflows/` 让日常维护任务定时自动化。

这是一套“本地开发 + CI 自动化 + 知识沉淀”一体化方案。

## 2.5.2 `.claude/` 目录逐项配置展示

根据仓库 README 与目录结构，`.claude/` 的关键组成如下：

### A) `settings.json`：运行时中枢

该文件集中定义 Hook、环境与行为策略。配套文档 `settings.md` 展示了几类典型配置：

- `UserPromptSubmit`：提示提交时做 skill evaluation（按关键词/路径/意图匹配技能）
- `PreToolUse`：主分支保护（阻止在 `main` 直接编辑）
- `PostToolUse`：
  1. 自动格式化（JS/TS）
  2. `package.json` 变更后自动安装依赖
  3. 测试文件改动后跑相关测试
  4. TS 文件变更后触发类型检查

这类配置把“编码后手工执行”的动作前移为自动化守门。

### B) `hooks/`：触发与路由规则

仓库内包含：

- `skill-eval.sh`
- `skill-eval.js`
- `skill-rules.json`
- `skill-rules.schema.json`

其中 `skill-rules.json` 用规则化匹配（关键词、路径、意图等）自动建议应启用的 Skill，是“技能路由层”的核心。

### C) `skills/`：领域知识模块

该 showcase 收录了 6 个技能目录（另有一个总览 `README.md`）：

1. `core-components`：组件库/设计系统规范
2. `formik-patterns`：Formik 表单与校验模式
3. `graphql-schema`：GraphQL 查询/变更与 codegen 约束
4. `react-ui-patterns`：加载态、错误态、数据态 UI 模式
5. `systematic-debugging`：四阶段调试法（先根因后修复）
6. `testing-patterns`：Jest + TDD + mocking/factory 模式

这 6 个 Skill 对应真实前端团队最常见的“重复决策场景”。

### D) `commands/`：斜杠命令工作流

仓库提供 6 个高频命令模板：

1. `onboard.md`：任务上手与上下文梳理
2. `pr-review.md`：按团队标准进行 PR Review
3. `pr-summary.md`：生成当前分支 PR 摘要
4. `code-quality.md`：目录级质量检查
5. `docs-sync.md`：文档与代码一致性检查
6. `ticket.md`：工单端到端流程（支持 JIRA/Linear/GitHub）

这些命令体现了“把常用提示词产品化”的思路。

### E) `agents/`：专职代理

仓库包含 2 个 agent 配置：

- `code-reviewer.md`：变更后深度审查代理
- `github-workflow.md`：GitHub 工作流任务代理

Agent 的价值在于“持续执行同一职责”，而不是每次由主对话临时扮演。

### F) 辅助文件

- `.claude/.gitignore`：隔离本地个性化设置
- `.claude/settings.md`：将 JSON 配置转为可读文档，便于团队讨论

## 2.5.3 README 展示出的系统化能力

仓库 README 重点展示了几条可复用路径：

1. **质量闸门自动化**：格式化、测试、类型检查、分支保护。
2. **代码审查自动化**：PR 阶段引入 Claude 审查工作流。
3. **定时维护自动化**：文档同步、代码质量巡检、依赖审计。
4. **Ticket 系统联动**：通过 MCP 打通工单与代码交付流程。

这些能力共同构成“可持续运转”的开发协作闭环。

## 2.5.4 `.mcp.json` 与外部系统接入

showcase 的 `.mcp.json` 给出了多服务接入范式，例如：

- `github`
- `jira`
- `linear`
- `postgres`
- `slack`
- `notion`
- `memory`

配置重点是：

- 使用标准 MCP server（多为 `npx` 启动）
- 通过环境变量注入凭据
- 把“跨系统上下文”从人工粘贴改为程序化可调用

## 2.5.5 GitHub Actions 配置项（showcase 四件套）

`.github/workflows/` 内包含 4 个代表性工作流：

1. `pr-claude-code-review.yml`：PR 自动审查
2. `scheduled-claude-code-docs-sync.yml`：定期文档同步
3. `scheduled-claude-code-quality.yml`：定期质量巡检
4. `scheduled-claude-code-dependency-audit.yml`：定期依赖审计

这说明 Claude Code 能力不仅在本地会话内生效，也可进入团队 CI/CD 体系。

## 2.5.6 迁移到你项目时的落地顺序（建议）

建议按下面顺序引入，避免一次性改太多：

1. 先落 `CLAUDE.md` + 2~3 个高频 `commands`。  
2. 再加 `skills/`（从一个技能开始，如 testing 或 debugging）。  
3. 再启用 `PostToolUse` 自动化（格式化/测试/类型检查）。  
4. 最后接入 MCP 与 GitHub Actions 定时任务。

这样可以逐步获得收益，同时控制变更风险。

---

## 参考资料

- <https://github.com/ChrisWiles/claude-code-showcase>
- <https://github.com/ChrisWiles/claude-code-showcase/tree/main/.claude>
- <https://github.com/ChrisWiles/claude-code-showcase/blob/main/README.md>
