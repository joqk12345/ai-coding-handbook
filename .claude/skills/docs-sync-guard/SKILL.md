---
name: docs-sync-guard
description: Keep timeline, architecture visualization, sidebar config, and SUMMARY order in sync after handbook content updates.
---

# Docs Sync Guard

Use this skill whenever handbook content changes under `part-*` or `appendix/`.

## Required sync targets
After content updates, ensure all of these are updated in the same change set:
1. `visualizations/timeline-overview.md`
2. `visualizations/architecture-overview.md`
3. `.vitepress/config.mts` (effective left sidebar links/order)
4. `SUMMARY.md` (table-of-contents source/order)

## Workflow
1. Update/finish chapter content.
2. Update timeline and architecture overview to reflect new structure.
3. Update `.vitepress/config.mts` sidebar links and ordering.
4. Update `SUMMARY.md` and keep chapter order aligned with sidebar.
5. Run `python .claude/scripts/check_doc_sync.py` and resolve reported mismatches.

## Fast trigger
Use slash command `/docs-sync` for a one-shot run.
