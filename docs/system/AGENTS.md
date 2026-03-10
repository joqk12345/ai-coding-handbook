---
id: "docs-system-agents"
title: "Agent Governance"
slug: "docs-system-agents"
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
display_order: 9
---
# Agent Governance

## Responsibilities
Agents operating in this repository must:

1. Classify each article using metadata frontmatter.
2. Keep article metadata up to date and schema-compliant.
3. Regenerate all files in `generated/` through scripts.
4. Preserve article bodies as the source of truth.

## Allowed Actions
- classify article
- update metadata
- regenerate views

## Forbidden Actions
- manual edits to `generated/*`
- modifying taxonomy without review
- deleting existing article content

## Operational Rules
- Run `npm run knowledge:lint` before committing metadata changes.
- Run `npm run knowledge:build` before committing generated outputs.
- Treat `meta/*` as governance-controlled configuration.
