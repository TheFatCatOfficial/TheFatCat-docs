#!/usr/bin/env python3
"""Check final website artifacts and the content-based script cache revision."""

import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
ASSET_MANIFEST = "_data/assets.json"
ASSETS = json.loads((ROOT / ASSET_MANIFEST).read_text())
SCRIPTS = tuple(asset["path"] for asset in ASSETS["scripts"])
STYLES = tuple(asset["path"] for asset in ASSETS["styles"])
BRAND_FILES = tuple("assets/brand/" + name for name in (
    "print.css", "local.css", "paper-fiber.svg", "bevan-latin.woff2", "OFL.txt", "manifest.json"))
LOCAL_PATH = re.compile(
    r"file:///(?:Users|home)/|/" r"Users/[^/\s]+/|/" r"home/[^/\s]+/|"
    r"(?i:[A-Z]:[\\/](?:Users|Documents and Settings)[\\/])"
)
CREDENTIAL = re.compile(
    r"-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----|"
    r"\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|"
    r"(?:AKIA|ASIA)[A-Z0-9]{16}|xox[baprs]-[A-Za-z0-9-]{20,})\b|"
    r"(?i:\b(?:private[_-]?key|client[_-]?secret|api[_-]?secret|"
    r"aws_secret_access_key|aws_session_token)\b[\"']?\s*[:=]\s*[\"']"
    r"[A-Za-z0-9+/=_-]{24,}[\"'])"
)


def revision(root: Path) -> str:
    digest = hashlib.sha256()
    assets = json.loads((root / ASSET_MANIFEST).read_text())
    sources = {ASSET_MANIFEST, *BRAND_FILES}
    sources.update(asset["path"] for asset in assets["scripts"])
    sources.update(str(path.relative_to(root)) for path in (root / "_sass").rglob("*.scss"))
    for name in sorted(sources):
        digest.update(name.encode() + b"\0" + (root / name).read_bytes() + b"\0")
    return digest.hexdigest()[:16]


class AssetReferences(HTMLParser):
    def __init__(self, content: str):
        super().__init__()
        self.scripts = []
        self.styles = []
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script" and "src" in attrs:
            self.scripts.append(attrs["src"])
        if tag == "link" and attrs.get("rel") == "stylesheet" and "href" in attrs:
            self.styles.append(attrs["href"])


def check_text(content: str, label: str) -> None:
    for number, line in enumerate(content.splitlines(), 1):
        for name, pattern in (("local path", LOCAL_PATH), ("credential marker", CREDENTIAL)):
            if pattern.search(line):
                raise ValueError(f"Build contains a {name}: {label}:{number}")
        if "sourceMappingURL" in line:
            raise ValueError(f"Build contains a source map reference: {label}:{number}")


def check_build(directory: Path) -> int:
    if not (directory / "index.html").is_file():
        raise ValueError("Build directory has no index.html")
    count = 0
    for path in sorted(directory.rglob("*")):
        label = str(path.relative_to(directory))
        if (label in {"whitepaper.html", "zh/whitepaper.html"}
                or label.startswith(("whitepaper/", "zh/whitepaper/", "assets/whitepaper/"))):
            raise ValueError(f"Build contains a withdrawn whitepaper: {label}")
        if ("technical-docs" in path.relative_to(directory).parts
                or label in {"contracts.html", "zh/contracts.html"}
                or label.startswith(("contracts/", "zh/contracts/"))):
            raise ValueError(f"Build contains a non-public technical document: {label}")
        if path.is_symlink():
            raise ValueError(f"Build contains a symlink: {label}")
        if not path.is_file():
            continue
        if path.suffix.lower() == ".map":
            raise ValueError(f"Build contains a source map: {label}")
        count += 1
        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        check_text(content, label)
    return count


def check_brand(root: Path, directory: Path) -> None:
    manifest = json.loads((root / "assets/brand/manifest.json").read_text())
    files = manifest.get("files", [])
    expected = {Path(name).name for name in BRAND_FILES} - {"manifest.json"}
    if manifest.get("schemaVersion") != 1 or len(files) != len(expected) or {entry["path"] for entry in files} != expected:
        raise ValueError("Brand manifest must list the reviewed brand files")
    for entry in files:
        source = root / "assets/brand" / entry["path"]
        if source.is_symlink() or hashlib.sha256(source.read_bytes()).hexdigest() != entry["sha256"]:
            raise ValueError("Brand file differs from its manifest: " + entry["path"])
    for name in BRAND_FILES:
        if not (directory / name).is_file() or (directory / name).read_bytes() != (root / name).read_bytes():
            raise ValueError("Built brand file differs from its source: " + name)


def check_revision(root: Path, directory: Path) -> None:
    expected = revision(root)
    configured = re.search(r"^assets_revision:\s*(\S+)\s*$", (root / "_config.yml").read_text(), re.MULTILINE)
    if not configured or configured.group(1) != expected:
        raise ValueError("Script revision is stale; run scripts/check-public-build.py --update-revision")
    check_brand(root, directory)
    for name in SCRIPTS:
        source = re.sub(rb"\A---\r?\n.*?\r?\n---\r?\n", b"", (root / name).read_bytes(), count=1, flags=re.DOTALL)
        if not (directory / name).is_file() or (directory / name).read_bytes() != source:
            raise ValueError(f"Built script differs from its source: {name}")
    for page in directory.rglob("*.html"):
        references = AssetReferences(page.read_text())
        for kind, names, urls in (("script", SCRIPTS, references.scripts), ("style", STYLES, references.styles)):
            for name in names:
                matches = [urlsplit(url) for url in urls if urlsplit(url).path.endswith("/" + name)]
                if len(matches) != 1 or matches[0].query != "v=" + expected:
                    raise ValueError(f"Page {kind} revision is missing or stale: {page.relative_to(directory)} ({name})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", nargs="?", type=Path, default=ROOT / "_site")
    parser.add_argument("--update-revision", action="store_true")
    args = parser.parse_args()
    try:
        if args.update_revision:
            config = ROOT / "_config.yml"
            updated, count = re.subn(r"^assets_revision:.*$", "assets_revision: " + revision(ROOT),
                                    config.read_text(), flags=re.MULTILINE)
            if count != 1:
                raise ValueError("Configuration must contain one assets_revision field")
            config.write_text(updated)
            print("Updated script revision from source content")
        else:
            count = check_build(args.directory)
            check_revision(ROOT, args.directory)
            print(f"Checked {count} website artifacts; script revision matches source")
    except ValueError as error:
        parser.exit(1, f"{error}\n")
