# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VitePress-based documentation site for an AI-assisted programming handbook (《AI-Coding 使用手册》). It covers Claude, Codex, Gemini, and other AI coding tools.

**Key Technologies:**
- VitePress 1.6+ for static site generation
- Vue 3 components for visualizations (timeline, architecture diagrams)
- GitHub Pages for deployment (base path: `/ai-coding-handbook/`)

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview

# Run documentation sync check
npm run docs:sync-check
```

## Project Architecture

### Directory Structure

```
├── part-1-introduction/          # Part 1: Getting Started
├── part-2-core-tools/            # Part 2: Core Tools (Claude, Codex, Gemini...)
├── part-3-advanced-techniques/   # Part 3: Advanced Techniques
├── part-4-practice/              # Part 4: Building Agents from Scratch
├── part-5-self-driving-codebase/ # Part 5: Self-Driving Codebase
├── appendix/                     # Appendices
├── visualizations/               # Timeline & architecture overview docs
├── .vitepress/                   # VitePress config, theme, components
│   ├── config.mts               # Main configuration
│   ├── theme/
│   │   ├── index.ts             # Theme registration
│   │   └── components/          # Vue visualization components
│   └── dist/                    # Build output
└── .claude/                     # Claude Code configuration
    ├── settings.json            # Shared team settings
    ├── scripts/                 # Automation scripts
    └── skills/                  # Claude skills
```

### Content Synchronization Requirements

When modifying content under `part-*/` or `appendix/`, you **must** update these files in the same change set:

1. `visualizations/timeline-overview.md` - Chapter timeline visualization
2. `visualizations/architecture-overview.md` - Content architecture diagram
3. `.vitepress/config.mts` - Sidebar navigation configuration
4. `SUMMARY.md` - Table of contents

**Verification:** Run `npm run docs:sync-check` or use the `/docs-sync` command to validate.

### Vue Components for Visualizations

Custom Vue components registered in `.vitepress/theme/index.ts`:
- `TimelineVisualization` - Renders the interactive timeline
- `ArchitectureVisualization` - Renders the architecture diagram

These are used in the visualization docs via `<TimelineVisualization />` and `<ArchitectureVisualization />`.

## Writing Conventions

### File Naming
- Chapters: `chapter-{N}-{kebab-case-title}.md`
- Examples: `chapter-2-1-claude-code-architecture.md`, `chapter-10-building-agent-from-scratch.md`

### Front Matter
VitePress uses YAML front matter. Standard fields:
```yaml
---
title: Chapter Title
outline: [2, 3]  # Heading levels to show in sidebar
---
```

### Internal Links
- Use VitePress clean URLs: `/part-2-core-tools/chapter-2-1-claude-code-architecture`
- The `.md` extension is automatically handled
- Use `%20` for spaces in paths: `Agent%20本质`

## Configuration Files

### .claude/settings.json
Shared team configuration for Claude Code:
- `PostToolUse` hook runs `check_doc_sync.py` after Write/Edit operations on content files
- Validates that documentation synchronization requirements are met

### .claude/settings.local.json
Local user settings (gitignored). Use for personal preferences.

## Deployment

The site is deployed to GitHub Pages:
- Base URL: `/ai-coding-handbook/`
- Build output: `.vitepress/dist/`
- Configure in repository Settings > Pages > Deploy from branch (gh-pages or GitHub Actions)

## Common Tasks

### Adding a New Chapter
1. Create file in appropriate `part-*/` directory
2. Add entry to `.vitepress/config.mts` sidebar
3. Add entry to `SUMMARY.md`
4. Update `visualizations/timeline-overview.md`
5. Update `visualizations/architecture-overview.md`
6. Run `npm run docs:sync-check` to verify

### Renaming a Chapter
1. Rename the file
2. Update all references in `.vitepress/config.mts`
3. Update all references in `SUMMARY.md`
4. Update visualizations if the chapter appears there
5. Run sync check

### Updating Visualization Components
Components are in `.vitepress/theme/components/`. After modifying:
1. Test with `npm run docs:dev`
2. Verify in `visualizations/` docs
3. Build with `npm run docs:build` to catch any TypeScript/Vue errors
