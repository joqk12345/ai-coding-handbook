---
id: "docs-system-architecture"
title: "Knowledge System Architecture"
slug: "docs-system-architecture"
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
display_order: 10
---
# Knowledge System Architecture

## Source of Truth
- Markdown article body text in repository content files.
- Frontmatter metadata in each markdown article.

## Control Plane
- `meta/taxonomy.yaml`
- `meta/architecture-layers.yaml`
- `meta/timeline-eras.yaml`
- `meta/content-schema.json`

## Build Plane
1. `scripts/ingest-article.ts` ensures required metadata exists.
2. `scripts/build-graph.ts` creates `generated/graph.json`.
3. View generators produce markdown artifacts in `generated/`.
4. `scripts/lint-structure.ts` enforces integrity checks.

## VitePress Integration
- `scripts/generate-vitepress-nav.ts` builds `.vitepress/knowledge-nav.json` from graph metadata.
- `.vitepress/config.mts` reads that file and mounts auto-generated navigation into sidebar/nav.
