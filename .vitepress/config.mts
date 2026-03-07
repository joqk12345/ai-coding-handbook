import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  base: '/ai-coding-handbook/',
  title: 'AI-Coding 使用手册',
  description: 'AI 辅助编程综合使用手册',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: "local"
    },
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
          { text: '第2章: 什么是代码助手', link: '/part-1-introduction/chapter-2-what-is-coding-assistant' },
          { text: '第4章: 编码解决后会发生什么？—— AI 优先的软件开发时代', link: '/part-1-introduction/chapter-4-ai-first-software-development' },
          { text: 'Agent 本质', link: '/part-1-introduction/Agent 本质' }
        ]
      },
      {
        text: '第二部分：核心工具详解',
        items: [
          { text: '第2章: Claude 使用手册', link: '/part-2-core-tools/chapter-2-claude-manual' },
          { text: '2.1: Claude Code 深度解析', link: '/part-2-core-tools/chapter-2-1-claude-code-architecture' },
          { text: '2.2: Advent of Claude - 31天精通 Claude Code', link: '/part-2-core-tools/chapter-2-2-advent-of-claude' },
          { text: '2.3: Agent Skills（智能体技能）入门', link: '/part-2-core-tools/chapter-2-3-agent-skills' },
          { text: '2.4: Claude Code 创造者如何使用 Claude Code', link: '/part-2-core-tools/chapter-2-4-how-creator-uses-claude-code' },
          { text: '2.5: Claude Code Showcase 配置拆解', link: '/part-2-core-tools/chapter-2-5-claude-code-showcase' },
          { text: '2.6: 实战中上下文的管理与添加', link: '/part-2-core-tools/chapter-2-6-context-management' },
          { text: '2.7: Claude Code 高级功能与使用技巧', link: '/part-2-core-tools/chapter-2-7-advanced-features' },
          { text: '2.8: 对话管理与上下文控制', link: '/part-2-core-tools/chapter-2-8-conversation-management' },
          { text: '2.9: 创建自定义命令', link: '/part-2-core-tools/chapter-2-9-custom-commands' },
          { text: '2.10: MCP 服务器扩展', link: '/part-2-core-tools/chapter-2-10-mcp-servers' },
          { text: '2.11: GitHub 集成', link: '/part-2-core-tools/chapter-2-11-github-integration' },
          { text: '2.12: Prompt 缓存即一切', link: '/part-2-core-tools/chapter-2-12-prompt-caching' },
          { text: '2.13: 像 Agent 一样思考', link: '/part-2-core-tools/chapter-2-13-agent-tool-design' },
          { text: '2.14: Git Worktree 模式与 Agent 工具设计艺术', link: '/part-2-core-tools/chapter-2-14-git-worktree-mode' },
          { text: '第3章: OpenAI Codex 深度解析', link: '/part-2-core-tools/chapter-3-codex-deep-dive' },
          { text: '3.1: OpenAI Codex 简介与演进脉络', link: '/part-2-core-tools/chapter-3-1-codex-introduction-and-evolution' },
          { text: '3.2: Codex 核心能力与技术特点', link: '/part-2-core-tools/chapter-3-2-codex-core-capabilities' },
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
          { text: '第12章: 多智能体系统', link: '/part-4-practice/chapter-12-multi-agent-systems' },
          { text: '第13章: 从怀疑者到信徒 —— 一位AI编码怀疑论者的深度实践', link: '/part-4-practice/chapter-13-skeptic-to-believer' },
          { text: '第14章: Claude Code Workflow —— 经过实战检验的 Agent 工作流模板', link: '/part-4-practice/chapter-14-claude-code-workflow' },
          { text: '第15章: Trellis —— 为 AI 设置规则的开放框架', link: '/part-4-practice/chapter-15-trellis' }
        ]
      },
      {
        text: '第五部分：自主代码库',
        items: [
          { text: '第17章: 自主代码库 - 背景智能体与软件交付的下一个时代', link: '/part-5-self-driving-codebase/chapter-13-the-self-driving-codebase' },
          { text: '第18章: 在 Agent-First 的世界中充分发挥 Codex 的威力', link: '/part-5-self-driving-codebase/chapter-14-leveraging-codex-in-agent-first-world' },
          { text: '第19章: Harness Engineering —— 在 Agent-First 世界中充分发挥 Codex 的威力', link: '/part-5-self-driving-codebase/chapter-15-harness-engineering' },
          { text: '第20章: 上下文工程的文件系统抽象 — AIGNE 框架', link: '/part-5-self-driving-codebase/chapter-16-context-engineering-file-system-abstraction' }
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
