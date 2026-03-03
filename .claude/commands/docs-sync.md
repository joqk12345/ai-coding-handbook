# /docs-sync

Run the docs synchronization guard for handbook structure updates.

## What this command should do
1. Run: `python .claude/scripts/check_doc_sync.py`
2. If the check fails, fix mismatches in:
   - `visualizations/timeline-overview.md`
   - `visualizations/architecture-overview.md`
   - `.vitepress/config.mts`
   - `SUMMARY.md`
3. Re-run until it passes.

## Success criteria
- Content updates are reflected in timeline and architecture docs.
- Sidebar entries in `.vitepress/config.mts` cover the updated chapters.
- `SUMMARY.md` chapter order is consistent with sidebar order.
