import fs from 'node:fs'
import { defineConfig } from 'vitepress'

const knowledgeSidebar = fs.existsSync('.vitepress/knowledge-nav.json')
  ? JSON.parse(fs.readFileSync('.vitepress/knowledge-nav.json', 'utf8'))
  : []

export default defineConfig({
  lang: 'zh-CN',
  base: '/ai-coding-handbook/',
  title: 'AI-Coding 使用手册',
  description: 'AI 辅助编程综合使用手册',
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence

      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token.info.trim() === 'mermaid') {
          const encoded = Buffer.from(token.content, 'utf8').toString('base64')
          return `<MermaidBlock encoded="${encoded}" />`
        }

        return defaultFence
          ? defaultFence(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)
      }
    }
  },
  themeConfig: {
    search: {
      provider: 'local'
    },
    nav: [
      { text: '前言', link: '/' },
      { text: '目录', link: '/SUMMARY' },
      { text: '知识系统', link: '/generated/summary' },
      { text: '参考资源', link: '/references' },
      { text: '贡献指南', link: '/CONTRIBUTING' },
      { text: 'Hooks 参考', link: '/2026-02-02-claude-code-hooks-reference' }
    ],
    sidebar: [
      {
        text: '系统总览',
        items: [
          { text: '目录总览', link: '/generated/summary' },
          { text: '学习时间线', link: '/generated/timeline' },
          { text: '内容架构', link: '/generated/architecture' },
          { text: '引用索引', link: '/generated/references' }
        ]
      },
      ...knowledgeSidebar,
      {
        text: '协作规范',
        items: [
          { text: '贡献指南', link: '/CONTRIBUTING' },
          { text: '文档结构与章节编号规范', link: '/docs/structure' },
          { text: '知识系统使用说明', link: '/docs/system/USAGE' }
        ]
      }
    ]
  }
})
