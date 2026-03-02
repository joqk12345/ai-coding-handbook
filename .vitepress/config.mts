import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  base: '/ai-coding-handbook/',
  title: 'AI-Coding 使用手册',
  description: 'AI 辅助编程综合使用手册',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '前言', link: '/' },
      { text: '目录', link: '/SUMMARY' },
      { text: '时间线', link: '/visualizations/timeline-overview' },
      { text: '架构图', link: '/visualizations/architecture-overview' },
      { text: '参考资源', link: '/references' },
      { text: 'Hooks 参考', link: '/2026-02-02-claude-code-hooks-reference' }
    ],
    sidebar: [
      {
        text: '可视化总览',
        items: [
          { text: '时间线', link: '/visualizations/timeline-overview' },
          { text: '架构图', link: '/visualizations/architecture-overview' }
        ]
      },
      {
        text: '第一部分：入门',
        items: [
          { text: '第1章: AI 编程新纪元', link: '/part-1-introduction/chapter-1-new-era-of-ai-programming' },
          { text: 'Agent 本质', link: '/part-1-introduction/Agent%20%E6%9C%AC%E8%B4%A8' }
        ]
      },
      {
        text: '第二部分：核心工具详解',
        items: [
          { text: '第2章: Claude 使用手册', link: '/part-2-core-tools/chapter-2-claude-manual' },
          { text: '第2.1章: Claude Code 深度解析', link: '/part-2-core-tools/chapter-2-1-claude-code-architecture' },
          { text: '第2.2章: Advent of Claude - 31天精通 Claude Code', link: '/part-2-core-tools/chapter-2-2-advent-of-claude' },
          { text: '第3章: OpenAI Codex 深度解析', link: '/part-2-core-tools/chapter-3-codex-deep-dive' },
          { text: '第4章: Gemini 编程实战', link: '/part-2-core-tools/chapter-4-gemini-in-practice' },
          { text: '第5章: 开源模型 (Opencode) 使用手册', link: '/part-2-core-tools/chapter-5-opencode-manual' },
          { text: '第6章: 其他AI编程工具概览', link: '/part-2-core-tools/chapter-6-other-tools-overview' }
        ]
      },
      {
        text: '第三部分：高级技巧与实战',
        items: [
          { text: '第7章: Prompt Engineering for Coders', link: '/part-3-advanced-techniques/chapter-7-prompt-engineering-for-coders' },
          { text: '第8章: AI驱动的测试与调试', link: '/part-3-advanced-techniques/chapter-8-ai-driven-testing' },
          { text: '第9章: 综合项目实战', link: '/part-3-advanced-techniques/chapter-9-capstone-project' }
        ]
      },
      {
        text: '第四部分：实践 - 从零构建 Agent',
        items: [
          { text: '第10章: 从零构建 AI Agent', link: '/part-4-practice/chapter-10-building-agent-from-scratch' },
          { text: '第11章: 高级 Agent 模式', link: '/part-4-practice/chapter-11-advanced-agent-patterns' },
          { text: '第12章: 多智能体系统', link: '/part-4-practice/chapter-12-multi-agent-systems' }
        ]
      },
      {
        text: '第五部分：自主代码库',
        items: [
          { text: '第13章: 自主代码库 - 背景智能体与软件交付的下一个时代', link: '/part-5-self-driving-codebase/chapter-13-the-self-driving-codebase' }
        ]
      },
      {
        text: '附录',
        items: [
          { text: '附录A: 常用AI工具速查表', link: '/appendix/appendix-a-cheatsheet' },
          { text: '附录B: 推荐资源与社区', link: '/appendix/appendix-b-resources' }
        ]
      },
      {
        text: '附加资料',
        items: [
          { text: 'Claude Code Hooks 参考', link: '/2026-02-02-claude-code-hooks-reference' }
        ]
      }
    ],
  }
})
