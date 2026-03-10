---
id: "docs-system-generated-files"
title: "Generated Files"
slug: "docs-system-generated-files"
date: "2025-01-01"
type: "article"
topics: []
concepts: []
tools: []
architecture_layer:
  - "systems-and-governance"
timeline_era: "autonomous-systems"
related: []
references: []
status: "published"
display_order: 12
---
# Generated Files

The `generated/` directory is machine-generated and should not be edited manually.
The auto-generated blocks inside `visualizations/timeline-overview.md` and `visualizations/architecture-overview.md` are also regenerated during build.

Files:
- `generated/summary.md`
- `generated/timeline.md`
- `generated/architecture.md`
- `generated/references.md`
- `generated/graph.json`

Additional generated integration file:
- `.vitepress/knowledge-nav.json`

Template pages with generated blocks:
- `visualizations/timeline-overview.md`
- `visualizations/architecture-overview.md`

Regenerate with:

```bash
npm run knowledge:build
```
