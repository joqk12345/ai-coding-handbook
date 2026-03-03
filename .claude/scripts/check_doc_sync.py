#!/usr/bin/env python3
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]

REQUIRED_FILES = [
    "visualizations/timeline-overview.md",
    "visualizations/architecture-overview.md",
    ".vitepress/config.mts",
    "SUMMARY.md",
]

CONTENT_PREFIXES = (
    "part-",
    "appendix/",
)


def run_git_diff_name_only():
    cmd = ["git", "diff", "--name-only", "HEAD"]
    out = subprocess.check_output(cmd, cwd=ROOT, text=True)
    return [line.strip() for line in out.splitlines() if line.strip()]


def is_content_file(path: str) -> bool:
    if not path.endswith(".md"):
        return False
    if path.startswith(CONTENT_PREFIXES):
        return True
    return path in {"references.md"}


def parse_summary_paths(summary_text: str):
    matches = re.findall(r"\(([^)]+\.md)\)", summary_text)
    return [m for m in matches if m.startswith(("part-", "appendix/"))]


def parse_config_sidebar_paths(config_text: str):
    links = re.findall(r"link:\s*'(/[^']+)'", config_text)
    result = []
    for link in links:
        p = link.lstrip("/")
        if p.startswith(("part-", "appendix/")):
            result.append(p + ".md")
    return result


def relative_order(seq, allowed_set):
    return [x for x in seq if x in allowed_set]


def main() -> int:
    changed = run_git_diff_name_only()
    changed_set = set(changed)

    content_changed = any(is_content_file(p) for p in changed)
    if not content_changed:
        print("[docs-sync] No handbook content changes detected; skip.")
        return 0

    missing_required = [p for p in REQUIRED_FILES if p not in changed_set]

    summary = (ROOT / "SUMMARY.md").read_text(encoding="utf-8")
    config = (ROOT / ".vitepress/config.mts").read_text(encoding="utf-8")

    summary_paths = parse_summary_paths(summary)
    config_paths = parse_config_sidebar_paths(config)

    summary_set = set(summary_paths)
    config_set = set(config_paths)

    missing_in_config = sorted(summary_set - config_set)
    missing_in_summary = sorted(config_set - summary_set)

    common = summary_set & config_set
    summary_order = relative_order(summary_paths, common)
    config_order = relative_order(config_paths, common)
    order_mismatch = summary_order != config_order

    errors = []
    if missing_required:
        errors.append("Required companion files not updated in this change:")
        errors.extend(f"  - {p}" for p in missing_required)

    if missing_in_config:
        errors.append("Paths in SUMMARY.md but missing from .vitepress/config.mts sidebar:")
        errors.extend(f"  - {p}" for p in missing_in_config)

    if missing_in_summary:
        errors.append("Paths in .vitepress/config.mts sidebar but missing from SUMMARY.md:")
        errors.extend(f"  - {p}" for p in missing_in_summary)

    if order_mismatch:
        errors.append("Order mismatch between SUMMARY.md and .vitepress/config.mts sidebar for shared chapter paths.")

    if errors:
        print("[docs-sync] FAILED")
        print("\n".join(errors))
        print("\nPlease sync timeline, architecture overview, sidebar, and summary before finishing.")
        return 1

    print("[docs-sync] PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
