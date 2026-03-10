---
id: "docs-system-usage"
title: "Knowledge System 使用说明"
slug: "docs-system-usage"
date: "2025-01-01"
type: "article"
topics:
  - "governance"
concepts: []
tools:
  - "vitepress"
architecture_layer:
  - "systems-and-governance"
timeline_era: "autonomous-systems"
related:
  - "docs-system-architecture"
  - "docs-system-generated-files"
references: []
status: "published"
display_order: 99
---
# Knowledge System 使用说明

本文说明知识系统如何与 VitePress 衔接，以及日常维护如何使用。

## 1. 关键目录

- `meta/`：分类、分层、时间线和 schema 的控制面配置。
- `scripts/`：元数据注入、图谱构建、视图生成、结构校验、Vite 导航生成。
- `generated/`：自动产物（目录、时间线、架构图、引用索引、知识图谱）。
- `visualizations/`：可视化模板页，正文自动区块会在构建时同步更新。
- `.vitepress/knowledge-nav.json`：由脚本自动生成的 VitePress 侧边栏片段。

## 2. 一次性生成（本地）

```bash
npm run knowledge:build
```

该命令会依次执行：

1. 生成知识图谱 `generated/graph.json`
2. 生成 `generated/*.md` 全局视图
3. 生成 `.vitepress/knowledge-nav.json`，用于 VitePress 自动侧边栏

## 3. 与 VitePress 的衔接

- `.vitepress/config.mts` 会读取 `.vitepress/knowledge-nav.json`。
- 顶部导航新增“知识系统”入口，指向自动目录页 `generated/summary.md`。
- 侧边栏中的章节顺序由 `.vitepress/knowledge-nav.json` 单独驱动，不再维护第二套手写章节顺序。
- `npm run docs:dev` / `npm run docs:build` 会先执行 `npm run knowledge:build`，确保页面和导航与元数据一致。

## 4. 日常维护流程

新增或修改文章后：

```bash
npm run knowledge:adopt -- path/to/article.md
npm run knowledge:lint
npm run docs:dev
```

说明：

- `knowledge:adopt`：对目标文件补全 frontmatter，自动插入 `SUMMARY.md` 对应分组，并重建自动目录、时间线、架构图与侧边栏。
- `knowledge:sync-summary`：自动校正 `SUMMARY.md` 中各章节分部标题的范围文案（例如 `第1-4章`）。
- `knowledge:ingest`：缺失 frontmatter 时补全。
- `knowledge:lint`：校验 ID 唯一性、元数据完整性、引用关系、时间线冲突。
- `knowledge:build`：先同步 `SUMMARY.md` 分部标题，再按 `SUMMARY.md` 的目录分组与阅读顺序重建图谱、全局视图与 Vite 导航。

## 5. 注意事项

- 不要手工编辑 `generated/*`、`.vitepress/knowledge-nav.json`，以及 `visualizations/*-overview.md` 中的自动生成区块。
- 章节顺序与分组以 `SUMMARY.md` 为准；自动目录、自动时间线、自动架构图都会复用该顺序。
- 如需扩展分类体系，先走 review 再改 `meta/*`。
- 正文内容仍是单一事实来源（single source of truth）。
