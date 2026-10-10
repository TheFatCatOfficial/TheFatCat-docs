#!/usr/bin/env python3
"""Check final website artifacts and the content-based script cache revision."""

import argparse
import hashlib
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ("assets/js/tfc-ai.js", "assets/js/tfc-pjax.js")
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
    for name in SCRIPTS:
        digest.update(name.encode() + b"\0" + (root / name).read_bytes() + b"\0")
    return digest.hexdigest()[:16]


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


def check_revision(root: Path, directory: Path) -> None:
    expected = revision(root)
    configured = re.search(r"^assets_revision:\s*(\S+)\s*$", (root / "_config.yml").read_text(), re.MULTILINE)
    if not configured or configured.group(1) != expected:
        raise ValueError("Script revision is stale; run scripts/check-public-build.py --update-revision")
    for name in SCRIPTS:
        if not (directory / name).is_file() or (directory / name).read_bytes() != (root / name).read_bytes():
            raise ValueError(f"Built script differs from its source: {name}")
    for page in directory.rglob("*.html"):
        references = re.findall(r'assets/js/tfc-(?:ai|pjax)\.js([^"\s]*)', page.read_text())
        if len(references) != 2 or any(value != "?v=" + expected for value in references):
            raise ValueError(f"Page script revision is missing or stale: {page.relative_to(directory)}")


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
