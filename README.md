# AI-Coding 使用手册

本项目旨在创建一本关于 AI 辅助编程的综合性使用手册，覆盖 Claude、Codex、Gemini 等主流工具。

## 在线阅读（目录）

- [目录](/SUMMARY)
- [第2.1章：Claude Code 深度解析](/part-2-core-tools/chapter-2-1-claude-code-architecture)

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
