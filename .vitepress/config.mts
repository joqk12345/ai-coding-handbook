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
        text: '第一部分：入门 (第1-3章)',
        items: [
          { text: '第1章: AI 编程新纪元', link: '/part-1/chapter-1-ai-programming-new-era' },
          { text: '第2章: 什么是代码助手', link: '/part-1/chapter-2-coding-assistant' },
          { text: '第3章: Agent 本质', link: '/part-1/chapter-3-agent-nature' },
          { text: '第3章(续): AI 优先的软件开发时代', link: '/part-1/chapter-4-ai-first-software-development' }
        ]
      },
      {
        text: '第二部分：核心工具详解 (第4-8章)',
        items: [
          { text: '第4章: Claude 使用手册', link: '/part-2/chapter-4-claude-manual' },
          { text: '4.1: Claude Code 深度解析', link: '/part-2/chapter-4-1-claude-code-architecture' },
          { text: '4.2: Advent of Claude - 31天精通 Claude Code', link: '/part-2/chapter-4-2-advent-of-claude' },
          { text: '4.3: Agent Skills（智能体技能）入门', link: '/part-2/chapter-4-3-agent-skills' },
          { text: '4.4: Claude Code 创造者如何使用 Claude Code', link: '/part-2/chapter-4-4-how-creator-uses-claude-code' },
          { text: '4.5: Claude Code Showcase 配置拆解', link: '/part-2/chapter-4-5-claude-code-showcase' },
          { text: '4.6: 实战中上下文的管理与添加', link: '/part-2/chapter-4-6-context-management' },
          { text: '4.7: Claude Code 高级功能与使用技巧', link: '/part-2/chapter-4-7-advanced-features' },
          { text: '4.8: 对话管理与上下文控制', link: '/part-2/chapter-4-8-conversation-management' },
          { text: '4.9: 创建自定义命令', link: '/part-2/chapter-4-9-custom-commands' },
          { text: '4.10: MCP 服务器扩展', link: '/part-2/chapter-4-10-mcp-servers' },
          { text: '4.11: GitHub 集成', link: '/part-2/chapter-4-11-github-integration' },
          { text: '4.12: Prompt 缓存即一切', link: '/part-2/chapter-4-12-prompt-caching' },
          { text: '4.13: 像 Agent 一样思考', link: '/part-2/chapter-4-13-agent-tool-design' },
          { text: '4.14: Git Worktree 模式与 Agent 工具设计艺术', link: '/part-2/chapter-4-14-git-worktree-mode' },
          { text: '第5章: OpenAI Codex 深度解析', link: '/part-2/chapter-5-codex-deep-dive' },
          { text: '5.1: OpenAI Codex 简介与演进脉络', link: '/part-2/chapter-5-1-codex-introduction' },
          { text: '5.2: Codex 核心能力与技术特点', link: '/part-2/chapter-5-2-codex-capabilities' },
          { text: '第6章: Gemini 编程实战', link: '/part-2/chapter-6-gemini-practice' },
          { text: '第7章: 开源模型 (Opencode) 使用手册', link: '/part-2/chapter-7-opencode-manual' },
          { text: '第8章: 其他AI编程工具概览', link: '/part-2/chapter-8-other-tools' }
        ]
      },
      {
        text: '第三部分：高级技巧与实战 (第9-11章)',
        items: [
          { text: '第9章: Prompt Engineering for Coders', link: '/part-3/chapter-9-prompt-engineering' },
          { text: '第10章: AI驱动的测试与调试', link: '/part-3/chapter-10-ai-testing' },
          { text: '第11章: 综合项目实战', link: '/part-3/chapter-11-capstone' }
        ]
      },
      {
        text: '第四部分：实践 - 从零构建 Agent (第12-17章)',
        items: [
          { text: '第12章: 从零构建 AI Agent', link: '/part-4/chapter-12-building-agent' },
          { text: '第13章: 高级 Agent 模式', link: '/part-4/chapter-13-advanced-patterns' },
          { text: '第14章: 多智能体系统', link: '/part-4/chapter-14-multi-agent' },
          { text: '第15章: Claude Code Workflow', link: '/part-4/chapter-15-claude-workflow' },
          { text: '第16章: Trellis 框架', link: '/part-4/chapter-16-trellis' },
          { text: '第17章: 从怀疑者到信徒', link: '/part-4/chapter-17-skeptic-believer' },
          { text: '第18章: 从怀疑到实践——三个月 AI Coding 实战复盘', link: '/part-4/chapter-18-ai-coding-journey' }
        ]
      },
      {
        text: '第五部分：自主代码库 (第19-22章)',
        items: [
          { text: '第19章: 自主代码库', link: '/part-5/chapter-18-self-driving-codebase' },
          { text: '第20章: 充分发挥 Codex 的威力', link: '/part-5/chapter-19-leveraging-codex' },
          { text: '第21章: Harness Engineering', link: '/part-5/chapter-20-harness-engineering' },
          { text: '第22章: 上下文工程 - AIGNE 框架', link: '/part-5/chapter-21-context-engineering' }
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