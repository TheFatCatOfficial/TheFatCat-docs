#!/usr/bin/env python3
"""Regression checks for final website publication checks."""

import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("public_build", Path(__file__).with_name("check-public-build.py"))
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class PublicBuildTests(unittest.TestCase):
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
            for name in gate.SCRIPTS:
                for directory in (root, built):
                    path = directory / name
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_text("window.test = true;\n")
            digest = gate.revision(root)
            (root / "_config.yml").write_text("assets_revision: " + digest + "\n")
            page = built / "index.html"
            page.write_text("\n".join(f'<script src="/{name}?v={digest}"></script>' for name in gate.SCRIPTS))
            gate.check_revision(root, built)
            page.write_text(page.read_text().replace(digest, "stale"))
            with self.assertRaisesRegex(ValueError, "Page script revision"):
                gate.check_revision(root, built)
            (root / gate.SCRIPTS[0]).write_text("window.test = false;\n")
            with self.assertRaisesRegex(ValueError, "Script revision is stale"):
                gate.check_revision(root, built)


if __name__ == "__main__":
    unittest.main()
