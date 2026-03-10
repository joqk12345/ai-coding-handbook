#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUMMARY = ROOT / 'SUMMARY.md'

link_re = re.compile(r"\[(.+?)\]\((.+?\.md)\)")


def expected_prefix(label: str) -> str | None:
    label = label.strip()
    m = re.match(r"^(第\d+章)", label)
    if m:
        return m.group(1)
    m = re.match(r"^(\d+\.\d+)", label)
    if m:
        return m.group(1)
    return None


def actual_prefix(md: Path) -> str | None:
    for line in md.read_text(encoding='utf-8').splitlines()[:40]:
        line = line.strip()
        if not line.startswith('# '):
            continue
        h = line[2:].strip()
        m = re.match(r"^(第\d+章)", h)
        if m:
            return m.group(1)
        m = re.match(r"^(\d+\.\d+)", h)
        if m:
            return m.group(1)
        return None
    return None


def main() -> int:
    errors = []
    for line in SUMMARY.read_text(encoding='utf-8').splitlines():
        for label, rel in link_re.findall(line):
            exp = expected_prefix(label)
            if not exp:
                continue
            md = (ROOT / rel).resolve()
            if not md.exists():
                errors.append(f"MISSING FILE: {rel}")
                continue
            got = actual_prefix(md)
            if got != exp:
                errors.append(f"MISMATCH: {rel} expected '{exp}' from SUMMARY label '{label}', got '{got}'")

    if errors:
        print('Chapter numbering validation failed:')
        for e in errors:
            print(' -', e)
        return 1

    print('Chapter numbering validation passed.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
