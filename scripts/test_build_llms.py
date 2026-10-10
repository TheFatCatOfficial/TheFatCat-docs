#!/usr/bin/env python3
"""Keep installed dependencies and build output out of the public text bundles."""

import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location("build_llms", Path(__file__).with_name("build-llms.py"))
GENERATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GENERATOR)


class BundleSourceTests(unittest.TestCase):
    def test_ignored_dependency_pages_are_excluded_from_both_languages(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for chinese, prefix in ((False, ""), (True, "zh/")):
                public_page = root / f"{prefix}index.md"
                public_page.parent.mkdir(parents=True, exist_ok=True)
                public_page.write_text("---\ntitle: Public guide\n---\nPublic guide content.\n")
                for directory in ("node_modules/package", "vendor/package", "_site", ".cache", "technical-docs"):
                    ignored_page = root / f"{prefix}{directory}/guide.md"
                    ignored_page.parent.mkdir(parents=True, exist_ok=True)
                    ignored_page.write_text("---\ntitle: Dependency guide\n---\nDependency fixture content.\n")
                marker = "来源章节" if chinese else "SOURCE"
                bundle = root / ("llms-full-zh.txt" if chinese else "llms-full.txt")
                bundle.write_text(f"# Fixture bundle\n\n---\n# {marker}: {prefix}node_modules/package/guide.md\n---\n\nOld section.\n")
                with patch.object(GENERATOR, "ROOT", root):
                    result = GENERATOR.render(bundle, chinese)
                with self.subTest(chinese=chinese):
                    self.assertIn(f"# {marker}: {prefix}index.md", result)
                    self.assertIn("Public guide content.", result)
                    self.assertNotIn("Dependency fixture content.", result)
                    self.assertNotIn("node_modules", result)
                    self.assertNotIn("technical-docs", result)
                    self.assertNotIn("Old section.", result)


if __name__ == "__main__":
    unittest.main()
