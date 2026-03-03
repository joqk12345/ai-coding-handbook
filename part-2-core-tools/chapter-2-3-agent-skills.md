# 第2.3章：Agent Skills（智能体技能）入门

> 参考文档：<https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview>

在 Claude 的 Agent 工作流中，**Agent Skills** 是一种把“可复用任务能力”沉淀为结构化说明的机制。你可以把它理解为给智能体增加一层“长期记忆化的工作方法”：当任务类型匹配时，模型会优先复用该技能，而不是每次都依赖临时提示词。

---

## 2.3.1 什么是 Agent Skills

Agent Skills 的核心目标是把高频流程标准化。相比一次性 Prompt，Skill 更强调：

- 任务边界清晰（做什么、不做什么）
- 执行步骤稳定（先后顺序固定）
- 输出格式统一（便于团队协作和自动化处理）

因此，Skill 更像“可版本化的 AI SOP（标准作业流程）”。

## 2.3.2 Agent Skills 的价值

### 1) 一致性
同类任务可以稳定产出统一结构，减少结果风格波动。

### 2) 可维护性
当流程需要更新时，只需调整 Skill 定义，不必重写大量历史 Prompt。

### 3) 可组合性
多个 Skills 可以在复杂任务中串联，形成分阶段执行链路。

### 4) 团队可协作
Skill 文件可以纳入 Git 管理，支持评审、回滚、共享。

## 2.3.3 一个可落地的 Skill 结构

一个实用的 Agent Skill，建议至少包含以下部分：

1. **适用场景**：什么请求触发该 Skill。  
2. **目标产物**：最终交付物是什么。  
3. **执行步骤**：建议流程与先后顺序。  
4. **工具约束**：允许使用的工具与禁止操作。  
5. **输出模板**：标题、段落、字段、引用规范。

如果你在团队里维护多个 Skill，建议统一模板，降低迁移成本。

### 补充：参考 AgentSkills.io 的规范结构（Specification）

除了项目内自定义模板，也可以参考 AgentSkills.io 提出的通用规范思路，把 Skill 组织成“可发现、可执行、可分发”的标准化结构。实践中可以重点关注三层：

1. **元信息层（Metadata）**：定义技能名、用途、触发描述、作者/版本等，解决“什么时候该触发这个技能”。  
2. **执行层（Instructions / Workflow）**：定义步骤、工具调用顺序、输入输出约束，解决“技能如何稳定执行”。  
3. **资源层（Assets / Scripts / References）**：把脚本、模板、参考文件放在技能目录中，解决“技能如何复用与演进”。

你可以把它理解为：

- 元信息决定“路由”；
- 执行流程决定“质量”；
- 资源目录决定“可维护性”。

在团队落地时，一个实用做法是：先按该规范整理目录与说明，再逐步把高频手工步骤沉淀到脚本或模板文件里。

> 规范引用：<https://agentskills.io/specification>

## 2.3.4 Skill 与 Prompt 的分层关系

可以用一句话区分两者：

- **Prompt**：这次任务“要做什么”。
- **Skill**：这类任务“长期怎么做”。

推荐做法是：

- 把稳定流程沉淀到 Skill；
- 把任务变量（具体对象、约束、目标）放在当次 Prompt。

这样既保持灵活性，也能保证输出质量的下限。

## 2.3.5 何时应该抽象成 Skill

下面场景适合把 Prompt 升级为 Skill：

- 同一类任务在项目中重复出现（如代码审查、发布说明、故障复盘）。
- 团队成员对输出格式有一致要求。
- 需要把“经验做法”沉淀为新成员可复用的流程。

一个简单经验法则：**当同类提示词重复出现 3 次以上，就值得考虑抽象成 Skill。**

## 2.3.6 在 Claude Code 中的实践建议（重写）

结合 Claude 官方支持文档《How to create custom Skills》，在 Claude Code 中落地 Skill 时建议按“**先小后大、先清晰后复杂**”的路径推进：

### 1) 先把 `Skill.md` 写对（最小可用版本）

每个 Skill 至少应有一个 `Skill.md`，并在文件头部提供 YAML frontmatter。优先保证两项元信息准确：

- `name`：人类可读的技能名称（简短明确）
- `description`：说明“做什么 + 何时触发”，这是模型路由 Skill 的核心依据

实践建议：先写一个仅包含 metadata + 简短说明的版本，再逐步加细节，避免一开始过度设计。

### 2) 用“渐进披露”组织内容

官方建议把 Skill 设计成分层读取：

- 元信息层：先判断该不该用这个 Skill
- Markdown 主体层：需要时再读取具体步骤
- 资源/脚本层：仅在执行时访问

在 Claude Code 场景下，这种结构能减少无效上下文加载，提高触发稳定性和执行效率。

### 3) 复杂信息放资源文件，不要把 `Skill.md` 写成巨型文档

如果规则很多（如品牌规范、行业术语、流程细则），建议拆分为 `resources/` 下的参考文件（如 `REFERENCE.md`），并在 `Skill.md` 中明确引用。

这样做的好处：

- 主文件更聚焦（便于维护）
- 规则可模块化更新
- 不同场景可按需加载

### 4) 需要自动化时再引入脚本，并提前声明依赖

当纯提示词不足以完成任务时，再添加脚本文件（Python/Node 等），并在 Skill 元信息中声明依赖。避免“脚本先行、规则缺失”的反模式。

同时注意运行环境差异：

- Claude / Claude Code 可从标准仓库安装依赖（如 PyPI、npm）
- API Skill 场景通常要求依赖预装，不应依赖运行时临时安装

### 5) 把“触发测试”作为验收标准

不要只测试“能不能运行”，更要测试“该不该触发”：

- 设计 3~5 条应该触发的提示词
- 设计 3~5 条不应触发的提示词
- 观察触发与执行结果，反向优化 `description`

这一步直接决定 Skill 的可用性上限。

### 6) 先单一工作流，再做 Skill 组合

官方最佳实践强调：一个 Skill 聚焦一个工作流。多个小 Skill 往往比一个“大而全 Skill”更稳定，并且更容易组合调用。

落地顺序建议：

1. 单 Skill 跑通（有明确输入、步骤、输出）
2. 增加示例输入/输出，降低歧义
3. 再与其他 Skill 组合，形成多阶段流程

### 7) 安全与治理不可省略

- 不要硬编码敏感信息（API Key、密码、Token）
- 对下载来的 Skill 先审计再启用
- 对外部服务访问使用受控连接（如合规的 MCP 配置）
- 为关键 Skill 建立版本与回滚机制

> 参考：
> - <https://support.claude.com/en/articles/12512198-how-to-create-custom-skills>

## 2.3.7 案例：`order-analysis-skill` 如何把 SOP 变成可复用 Skill

这里参考开源案例：`heimanba/order-analysis-skill`。这个案例的目标不是“让 AI 点击页面”，而是把“工单分析 SOP”封装成稳定 Skill：

- 人工完成一次登录（保留真实会话态）
- 从浏览器 DevTools 复制 `Copy as fetch`
- 用 `agent-browser --cdp 9222 eval` 直接执行请求脚本
- 把返回 JSON 交给 Claude 做问题归类与报告输出

这体现了一个关键工程思想：**尽量让 Skill 处理“稳定数据接口”，而不是“不稳定页面操作”**。

### 这个案例为什么有代表性

1. **把“流程”写成资产**：仓库中把流程拆成 `SKILL.md + scripts/*`，从文档说明升级为可执行规范。  
2. **把“前置检查”标准化**：先执行 `check-cdp.sh` 和 `check-agent-browser.sh`，减少环境不一致导致的失败。  
3. **把“输出”标准化**：统一写入 `.output/order-analysis/<timestamp>/`，便于追踪与复盘。  
4. **把“分析”结构化**：先拿到 `order.json`，再产出 `order_report.md`，形成数据到结论的闭环。

### 可迁移的 Skill 设计模板（从该案例抽象）

你可以把这个结构迁移到其他内部系统（客服单、告警单、审批流、运营报表）：

- **Skill 元信息**：`name`、`description` 明确能力边界。  
- **步骤化流程**：前置检查 → 数据采集 → 数据分析 → 报告输出。  
- **工具约束**：统一工具入口（如 `agent-browser --cdp 9222`），降低调用漂移。  
- **产物约定**：原始数据（JSON）与结论报告（Markdown）分离，便于审计。

### 落地时的注意事项

- 首次仍需人工登录，Skill 不应绕过权限与认证边界。  
- 接口字段变化时要同步更新脚本（例如 `scripts/order-analysis.js`）。  
- 若团队协作，建议把常用参数（时间范围、产品线）模板化，减少手工改动。

> 参考：
> - <https://github.com/heimanba/order-analysis-skill>
> - <https://github.com/heimanba/order-analysis-skill/blob/main/SKILL.md>
> - <https://github.com/heimanba/order-analysis-skill/blob/main/README.md>

## 2.3.8 官方仓库案例：Anthropic `skills/` 里的 16 个示例

Anthropic 官方仓库 `anthropics/skills` 在 `skills/` 目录下给出了 16 个可直接学习的技能样例。为了避免“只看名字看不出价值”，下面按场景做一个简要展示。

### A. 设计与内容生成类（创意 + 品牌）

- `algorithmic-art`：面向生成艺术，强调“算法哲学 + 代码表达”，不是简单画图。  
- `canvas-design`：用于海报/视觉稿，输出静态设计文件（如 PNG/PDF）。  
- `brand-guidelines`：把品牌色、字体、视觉规范统一落地。  
- `theme-factory`：给文档/页面/幻灯片应用可复用主题。  
- `slack-gif-creator`：按 Slack 尺寸与限制生产 GIF。

**展示示例（brand-guidelines）**：
- 触发："把这个报告页面改成 Anthropic 品牌风格"  
- Skill 行为：应用品牌色板、字体和视觉约束  
- 交付：风格一致的页面或文档产物

### B. 文档与办公文件类（知识生产）

- `doc-coauthoring`：文档共创流程，强调先收集上下文再打磨结构。  
- `internal-comms`：内部沟通文案（周报、公告、复盘）模板化写作。  
- `docx`：Word 文件读写、编辑、排版。  
- `pptx`：演示文稿创建、修改、拆分合并。  
- `pdf`：PDF 解析、提取、OCR、合并拆分。  
- `xlsx`：表格清洗、计算、格式化与导出。

**展示示例（doc-coauthoring）**：
- 触发："帮我写一份技术方案文档"  
- Skill 行为：先问清背景与目标，再给结构，再进入迭代  
- 交付：可评审的结构化文档，而非一次性草稿

### C. 工程开发与自动化类（构建 + 验证）

- `frontend-design`：高质量前端界面与组件实现。  
- `web-artifacts-builder`：构建复杂 Web Artifact（React/Tailwind/shadcn）。  
- `webapp-testing`：基于 Playwright 的本地 Web 测试流程。  
- `mcp-builder`：MCP 服务端开发指南（Python/Node）。  
- `skill-creator`：用于创建和迭代优化 Skill 本身。

**展示示例（webapp-testing）**：
- 触发："帮我验证本地登录流程是否回归"  
- Skill 行为：生成并运行 Playwright 测试步骤，收集日志/截图  
- 交付：可复现的测试结果与问题定位线索

### D. 一眼看懂这 16 个案例的“共同结构”

虽然方向不同，但它们普遍都具备同样的 Skill 结构：

1. **明确触发条件**（什么时候应该调用这个 Skill）  
2. **明确执行路径**（按步骤完成，不是泛泛建议）  
3. **明确交付产物**（文件、报告、测试结果等）

### 从这 16 个案例可以学到什么

- **触发描述要具体**：很多 Skill 在 `description` 里写清了触发关键词与边界。  
- **交付物要明确**：例如输出文件格式、目录结构、命令步骤。  
- **把“工具使用”写成 SOP**：不是泛泛地说“会用工具”，而是给出可执行路径。  
- **覆盖“输入→处理→输出”全链路**：让 Skill 能在真实工作流中稳定复用。

## 2.3.9 Skill 生态：从官方示例到社区精选

除了官方 `anthropics/skills`，社区也在快速沉淀可复用 Skill。一个常用入口是：

- `heilcheng/awesome-agent-skills`（聚合型清单）

这类生态仓库的价值在于：

1. **发现效率高**：能快速看到不同领域（开发、测试、文档、运营）的 Skill 模式。  
2. **对比成本低**：同类 Skill 放在一起更容易比较触发条件、目录结构、脚本设计。  
3. **迁移速度快**：团队可先“借鉴结构”，再替换成内部工具与约束。

## 2.3.10 在社区 Skill 生态中需要注意的事情

引用社区 Skill 时，建议重点把控以下风险：

1. **可信度与维护状态**：优先选择活跃维护、说明完整、Issue 可追踪的仓库。  
2. **许可证与合规**：确认 License 是否允许内部改造与再分发。  
3. **安全边界**：审查脚本是否涉及高风险命令、敏感文件读取、外部网络发送。  
4. **环境耦合**：很多 Skill 强依赖特定系统（OS、CLI、目录结构、权限模式），需要做本地化适配。  
5. **提示词注入与越权风险**：对外部文本输入保持防御性，不要直接信任并执行未审查指令。  
6. **版本漂移**：将引入的 Skill 固定版本，并建立升级与回归验证机制。

一个实用做法是：

- 先在沙盒环境验证社区 Skill；
- 再进入团队仓库并加上审计日志/权限约束；
- 最后通过真实任务回归后再推广。

> 参考：
> - <https://support.claude.com/en/articles/12512198-how-to-create-custom-skills>
> - <https://github.com/anthropics/skills/tree/main/skills>
> - <https://github.com/heilcheng/awesome-agent-skills/tree/main>

---

通过把“临时提示技巧”升级为“可维护技能资产”，你可以逐步把 Agent 从“能帮忙”提升到“可协作、可规模化复用”。
