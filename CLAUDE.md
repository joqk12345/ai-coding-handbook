# CLAUDE.md

## 项目上下文
- 这是一个基于 VitePress 的 AI 编程手册仓库。
- 主要内容是 `part-*` 目录下的 Markdown 章节，以及仓库根目录的说明文档。

## 协作约定（基础版）
- 变更尽量小、聚焦单一目标。
- 优先沿用现有目录结构、标题层级和写作风格。
- 新增文档时，命名风格与现有文件保持一致。

## 常用命令
- 安装依赖：`npm install`
- 本地开发：`npm run docs:dev`
- 构建文档：`npm run docs:build`
- 预览构建：`npm run docs:preview`

## .claude 配置说明
- 团队共享配置：`.claude/settings.json`
- 本地私有配置：`.claude/settings.local.json`（已在 `.claude/.gitignore` 中忽略）

## 内容更新同步（最小自动化）
- 更新 `part-*` 或 `appendix/` 章节后，需同步更新：
  - `visualizations/timeline-overview.md`
  - `visualizations/architecture-overview.md`
  - `.vitepress/config.mts`
  - `SUMMARY.md`
- 可手动运行：`npm run docs:sync-check`
- 已配置 `PostToolUse` 基础检查：编辑后会执行 `.claude/scripts/check_doc_sync.py`
