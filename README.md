---
id: "readme"
title: "AI-Coding 使用手册"
slug: "readme"
date: "2025-01-01"
type: "article"
topics: []
concepts: []
tools: []
architecture_layer:
  - "workflows-and-practices"
timeline_era: "autonomous-systems"
related: []
references: []
status: "published"
display_order: 4
---
# AI-Coding 使用手册

本项目旨在创建一本关于 AI 辅助编程的综合性使用手册，覆盖 Claude、Codex、Gemini 等主流工具。

## 在线阅读（目录）

- [目录](/SUMMARY)
- [5.1: Claude Code 深度解析](/part-2/chapter-4-1-claude-code-architecture)

## 本地预览（VitePress）

```bash
npm install
npm run docs:dev
```

打开 `http://localhost:5173` 即可预览。

## 构建静态站点

```bash
npm run docs:build
npm run docs:preview
```

构建输出目录为 `.vitepress/dist`，可直接用于 GitHub Pages 发布。


## 知识系统（自动生成）

```bash
npm run knowledge:ingest
npm run knowledge:lint
npm run knowledge:build
```

- 自动目录：`/generated/summary`
- 自动时间线：`/generated/timeline`
- 自动架构图：`/generated/architecture`
- 自动引用索引：`/generated/references`
- 使用说明：`/docs/system/USAGE`

## 参与贡献

- [贡献指南](./CONTRIBUTING.md)
- [文档结构与章节编号规范](./docs/structure.md)

