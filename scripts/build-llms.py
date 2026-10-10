#!/usr/bin/env python3
"""Rebuild the bilingual full-text bundles from their Markdown source pages."""
import argparse
from html import unescape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CONFIG = dict(re.findall(r"^(url|baseurl):\s*(\S+)\s*$", (ROOT / "_config.yml").read_text(), re.MULTILINE))
SITE_URL = CONFIG["url"].rstrip("/") + CONFIG["baseurl"].rstrip("/")


def public_url(path):
    path = path.lstrip("/")
    if path.endswith(".md"):
        source = ROOT / path
        frontmatter = source.read_text().split("---\n", 2)[1]
        permalink = re.search(r"^permalink:\s*['\"]?([^'\"\s]+)", frontmatter, re.MULTILINE)
        if permalink:
            path = permalink.group(1).lstrip("/")
        elif path.endswith("index.md"):
            path = path[:-len("index.md")]
        else:
            path = path[:-3] + ".html"
    return SITE_URL + "/" + path


def plain_body(body):
    body = re.sub(r"{%\s*link\s+([^\s%]+)\s*%}", lambda m: public_url(m.group(1)), body)
    body = re.sub(r"{{\s*['\"]([^'\"]+)['\"]\s*\|\s*relative_url\s*}}", lambda m: public_url(m.group(1)), body)
    body = re.sub(r"\{:[^}\n]+\}", "", body)
    body = re.sub(r"<!--.*?-->", "", body, flags=re.DOTALL)
    body = re.sub(r"<pre\b[^>]*>\s*<code\b[^>]*>(.*?)</code>\s*</pre>", lambda m: "\n```text\n" + unescape(m.group(1)).strip() + "\n```\n", body, flags=re.DOTALL)
    body = re.sub(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', lambda m: "[" + m.group(2).strip() + "](" + m.group(1) + ")", body, flags=re.DOTALL)
    body = re.sub(r"<h3\b[^>]*>", "\n### ", body)
    body = re.sub(r"</h3>", "\n", body)
    body = re.sub(r"</?p\b[^>]*>|<br\s*/?>", "\n", body)
    body = re.sub(r"</?(?:div|span)\b[^>]*>", "", body)
    body = unescape(body)
    if "{%" in body or "{{" in body:
        raise ValueError("Unresolved Liquid in LLM bundle")
    body = "\n".join(line.rstrip() for line in body.splitlines())
    return re.sub(r"\n[ \t]*\n(?:[ \t]*\n)+", "\n\n", body).strip()


def render(bundle, chinese):
    previous = bundle.read_text()
    marker = "来源章节" if chinese else "SOURCE"
    order = re.findall(rf"^# {marker}: (.+)$", previous, re.MULTILINE)
    pages = {
        str(path.relative_to(ROOT))
        for path in ROOT.rglob("*.md")
        if not any(part.startswith(("_", ".")) or part in {"vendor", "node_modules", "technical-docs"} for part in path.relative_to(ROOT).parts)
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
        body = plain_body(source.split("---\n", 2)[2])
        sections.append(f"---\n# {marker}: {page}\n---\n\n{public_url(page)}\n\n{body}")
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
