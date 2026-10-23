#!/usr/bin/env python3
"""Generate bilingual indexes and full-text bundles from the documentation catalog."""
import argparse
import json
from html import unescape
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
CONFIG = dict(re.findall(r"^(url|baseurl):\s*(\S+)\s*$", (ROOT / "_config.yml").read_text(), re.MULTILINE))
SITE_URL = CONFIG["url"].rstrip("/") + CONFIG["baseurl"].rstrip("/")
AI_USAGE = json.loads((ROOT / "_data/ai_usage.json").read_text())


def with_ai_usage(text, chinese):
    title, _, body = text.partition("\n\n")
    body = re.sub(r"^> (?:AI usage|AI 使用说明): [^\n]*\n\n", "", body)
    label = "AI 使用说明" if chinese else "AI usage"
    notice = AI_USAGE["zh" if chinese else "en"]
    return title + "\n\n" + f"> {label}: {notice}\n\n" + body


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


def resolve_links(body):
    body = re.sub(r"{%\s*link\s+([^\s%]+)\s*%}", lambda m: public_url(m.group(1)), body)
    body = re.sub(r"{{\s*['\"]([^'\"]+)['\"]\s*\|\s*relative_url\s*}}", lambda m: public_url(m.group(1)), body)
    return body


def expand_components(sources):
    components = {
        page: resolve_links(body) for page, body in sources.items()
        if re.search(r"{%-?\s*(?:include(?:_cached)?|capture)\b", body)
    }
    if not components:
        return {}
    renderer = Path(__file__).with_name("render-components.rb")
    result = subprocess.run(
        ["bundle", "exec", "ruby", str(renderer), str(ROOT)],
        input=json.dumps(components), cwd=renderer.parent.parent,
        text=True, capture_output=True, check=True,
    )
    return json.loads(result.stdout)


def plain_body(body):
    body = resolve_links(body)
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


def catalog(chinese):
    language = "zh" if chinese else "en"
    data = json.loads((ROOT / "_data/docs.json").read_text())[language]
    order = [page["path"] for page in data["pages"]]
    if len(order) != len(set(order)):
        raise ValueError(f"Duplicate source in {language} documentation catalog")
    sources = {
        str(path.relative_to(ROOT))
        for path in ROOT.rglob("*.md")
        if not any(part.startswith(("_", ".")) or part in {"vendor", "node_modules", "technical-docs"} for part in path.relative_to(ROOT).parts)
        and "whitepaper" not in path.relative_to(ROOT).parts and path.name != "whitepaper.md"
        and path.read_text().startswith("---\n")
        and (path.relative_to(ROOT).parts[0] == "zh") == chinese
    }
    if set(order) != sources:
        raise ValueError(f"Documentation catalog mismatch ({language}): "
                         f"unlisted={sorted(sources - set(order))}, missing={sorted(set(order) - sources)}")
    indexed = [page["index"] for page in data["pages"] if page["index"] is not None]
    if len({entry["order"] for entry in indexed}) != len(indexed):
        raise ValueError(f"Duplicate index order in {language} documentation catalog")
    return data


def render_full(chinese):
    data = catalog(chinese)
    order = [page["path"] for page in data["pages"]]
    marker = "来源章节" if chinese else "SOURCE"
    intro = data["full_intro"].format(chapter_count=len(order), docs_url=public_url("zh/" if chinese else ""))
    header = with_ai_usage(data["full_title"] + "\n\n" + intro, chinese)
    sources = {page: (ROOT / page).read_text().split("---\n", 2)[2] for page in order}
    components = expand_components(sources)
    sections = []
    for page in order:
        body = plain_body(components.get(page, sources[page]))
        sections.append(f"---\n# {marker}: {page}\n---\n\n{public_url(page)}\n\n{body}")
    return header + "\n\n" + "\n\n".join(sections) + "\n"


def render_index(chinese):
    data = catalog(chinese)
    lines = [with_ai_usage(data["index_title"] + "\n\n" + data["index_intro"], chinese)]
    pages = sorted((page for page in data["pages"] if page["index"] is not None),
                   key=lambda page: page["index"]["order"])
    section = None
    for page in pages:
        entry = page["index"]
        if section != entry["section"]:
            section = entry["section"]
            lines.append("\n## " + section)
        lines.append(f'- [{entry["title"]}]({public_url(page["path"])}): {entry["description"]}')
    entry = data["full_link"]
    full_url = public_url("llms-full-zh.txt" if chinese else "llms-full.txt")
    lines.extend(["\n## " + entry["section"], f'- [{entry["title"]}]({full_url}): {entry["description"]}'])
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if a bundle is stale")
    args = parser.parse_args()
    stale = []
    for name, chinese in (("llms-full.txt", False), ("llms-full-zh.txt", True), ("llms.txt", False), ("llms-zh.txt", True)):
        bundle = ROOT / name
        expected = render_full(chinese) if name.startswith("llms-full") else render_index(chinese)
        if args.check:
            if not bundle.is_file() or bundle.read_text() != expected:
                stale.append(name)
        else:
            bundle.write_text(expected)
    if stale:
        raise SystemExit("Stale bundles: " + ", ".join(stale))
    print("LLM bundles " + ("match Markdown sources" if args.check else "rebuilt"))


if __name__ == "__main__":
    main()
