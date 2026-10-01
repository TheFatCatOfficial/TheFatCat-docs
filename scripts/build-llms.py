#!/usr/bin/env python3
"""Rebuild the bilingual full-text bundles from their Markdown source pages."""
import argparse
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def render(bundle, chinese):
    previous = bundle.read_text()
    marker = "来源章节" if chinese else "SOURCE"
    order = re.findall(rf"^# {marker}: (.+)$", previous, re.MULTILINE)
    pages = {
        str(path.relative_to(ROOT))
        for path in ROOT.rglob("*.md")
        if not any(part.startswith(("_", ".")) or part == "vendor" for part in path.relative_to(ROOT).parts)
        and path.read_text().startswith("---\n")
        and (path.relative_to(ROOT).parts[0] == "zh") == chinese
    }
    order = [page for page in order if page in pages]
    order += sorted(pages - set(order))
    if len(order) != len(set(order)):
        raise ValueError(f"Duplicate source in {bundle.name}")
    header = previous.split("\n---\n# ", 1)[0].rstrip()
    header = re.sub(r"全部 \d+ 个章节", f"全部 {len(order)} 个章节", header)
    sections = []
    for page in order:
        source = (ROOT / page).read_text()
        body = source.split("---\n", 2)[2].strip()
        sections.append(f"---\n# {marker}: {page}\n---\n\n{body}")
    return header + "\n\n" + "\n\n".join(sections) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if a bundle is stale")
    args = parser.parse_args()
    stale = []
    for name, chinese in (("llms-full.txt", False), ("llms-full-zh.txt", True)):
        bundle = ROOT / name
        expected = render(bundle, chinese)
        if args.check:
            if bundle.read_text() != expected:
                stale.append(name)
        else:
            bundle.write_text(expected)
    if stale:
        raise SystemExit("Stale bundles: " + ", ".join(stale))
    print("LLM bundles " + ("match Markdown sources" if args.check else "rebuilt"))


if __name__ == "__main__":
    main()
