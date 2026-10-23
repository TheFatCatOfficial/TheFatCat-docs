#!/usr/bin/env python3
"""Regression checks for final website publication checks."""

import importlib.util
from pathlib import Path
import shutil
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("public_build", Path(__file__).with_name("check-public-build.py"))
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class PublicBuildTests(unittest.TestCase):
    def test_withdrawn_whitepaper_pages_and_pdfs_are_rejected(self):
        for name in ("whitepaper.html", "zh/whitepaper.html", "whitepaper/downloads.html",
                     "zh/whitepaper/math-overview.html", "assets/whitepaper/whitepaper.pdf"):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                (root / "index.html").write_text("<!doctype html>")
                candidate = root / name
                candidate.parent.mkdir(parents=True, exist_ok=True)
                candidate.write_text("Local whitepaper content")
                with self.assertRaisesRegex(ValueError, "withdrawn whitepaper"):
                    gate.check_build(root)

    def test_brand_manifest_and_built_assets_are_checked(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name in gate.BRAND_FILES:
                target = root / name
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(gate.ROOT / name, target)
            gate.check_brand(root, root)
            font = root / "assets/brand/bevan-latin.woff2"
            font.write_bytes(font.read_bytes() + b"changed")
            with self.assertRaisesRegex(ValueError, "Brand file differs"):
                gate.check_brand(root, root)

    def test_local_paths_and_credentials_are_rejected_without_values(self):
        for value in ("/" + "Users/example/private-notes", "C:" + "\\" + r"Users\example\notes",
                      "-----BEGIN PRIVATE KEY-----", "ghp_" + "x" * 36,
                      "client_secret = '" + "x" * 32 + "'"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError) as error:
                    gate.check_text(value, "page.html")
                self.assertNotIn(value, str(error.exception))

    def test_public_contacts_and_dependency_markers_are_allowed(self):
        gate.check_text("Contact public@thefatcat.fun; KaTeX MIT; "
                        "sha384-publicIntegrity; token = parsedToken; "
                        "https://chatgpt.com/?q=docs", "page.html")

    def test_source_map_reference_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "source map reference"):
            gate.check_text("/*# sourceMappingURL=theme.css.map */", "theme.css")

    def test_private_technical_documents_and_withdrawn_contract_pages_are_rejected(self):
        for name in ("technical-docs/en/safety/monitoring.html", "contracts.html",
                     "zh/contracts.html", "contracts/core-vaults.html",
                     "zh/contracts/seniority-ledger.html"):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                (root / "index.html").write_text("<!doctype html>")
                candidate = root / name
                candidate.parent.mkdir(parents=True, exist_ok=True)
                candidate.write_text("Private technical content")
                with self.assertRaisesRegex(ValueError, "non-public technical document"):
                    gate.check_build(root)

    def test_maps_and_symlinks_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "index.html").write_text("<!doctype html>")
            candidate = root / "theme.css.map"
            candidate.write_text("{}")
            with self.assertRaisesRegex(ValueError, "source map"):
                gate.check_build(root)
            candidate.unlink()
            candidate.symlink_to(root / "index.html")
            with self.assertRaisesRegex(ValueError, "symlink"):
                gate.check_build(root)

    def test_source_and_built_revisions_must_match(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            built = root / "_site"
            (root / "_data").mkdir()
            shutil.copy2(gate.ROOT / gate.ASSET_MANIFEST, root / gate.ASSET_MANIFEST)
            for name in gate.BRAND_FILES:
                for directory in (root, built):
                    target = directory / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(gate.ROOT / name, target)
            for name in gate.SCRIPTS:
                for directory in (root, built):
                    path = directory / name
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_text("window.test = true;\n")
            style_source = root / "_sass/custom/custom.scss"
            style_source.parent.mkdir(parents=True)
            style_source.write_text(".main { position: relative; }\n")
            # Jekyll removes front matter when a script has it.
            search_source = root / gate.SCRIPTS[0]
            search_source.write_text("---\nlayout: null\n---\n" + search_source.read_text())
            digest = gate.revision(root)
            (root / "_config.yml").write_text("assets_revision: " + digest + "\n")
            page = built / "index.html"
            original_page = "\n".join(
                [f'<script src="/{name}?v={digest}"></script>' for name in gate.SCRIPTS]
                + [f'<link rel="stylesheet" href="/{name}?v={digest}">' for name in gate.STYLES])
            page.write_text(original_page)
            gate.check_revision(root, built)
            font = root / "assets/brand/bevan-latin.woff2"
            original_font = font.read_bytes()
            font.write_bytes(original_font + b"changed")
            with self.assertRaisesRegex(ValueError, "Script revision is stale"):
                gate.check_revision(root, built)
            font.write_bytes(original_font)
            page.write_text(original_page.replace(f'{gate.STYLES[0]}?v={digest}', gate.STYLES[0]))
            with self.assertRaisesRegex(ValueError, "Page style revision"):
                gate.check_revision(root, built)
            page.write_text(original_page)
            original_style = style_source.read_text()
            style_source.write_text(".main { position: static; }\n")
            with self.assertRaisesRegex(ValueError, "Script revision is stale"):
                gate.check_revision(root, built)
            style_source.write_text(original_style)
            partial = style_source.with_name("_article.scss")
            partial.write_text("table { color: green; }\n")
            with self.assertRaisesRegex(ValueError, "Script revision is stale"):
                gate.check_revision(root, built)
            partial.unlink()
            page.write_text(page.read_text().replace(digest, "stale"))
            with self.assertRaisesRegex(ValueError, "Page script revision"):
                gate.check_revision(root, built)
            (root / gate.SCRIPTS[0]).write_text("window.test = false;\n")
            with self.assertRaisesRegex(ValueError, "Script revision is stale"):
                gate.check_revision(root, built)


if __name__ == "__main__":
    unittest.main()
