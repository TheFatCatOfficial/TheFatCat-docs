#!/usr/bin/env python3
"""Keep installed dependencies and build output out of the public text bundles."""

import importlib.util
import json
import shutil
import subprocess
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


    def test_components_share_data_and_preserve_diagram_text_in_both_languages(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            root.joinpath("_config.yml").write_text("url: https://docs.example.test\nbaseurl: /docs\n")
            includes = root / "_includes/components"
            includes.mkdir(parents=True)
            for name in ("link-directory.html", "diagram-frame.html"):
                shutil.copyfile(GENERATOR.ROOT / "_includes/components" / name, includes / name)
            data_path = root / "_data/official_links.json"
            data_path.parent.mkdir()
            data = json.loads((GENERATOR.ROOT / "_data/official_links.json").read_text())
            data_path.write_text(json.dumps(data))
            for chinese, prefix, language in ((False, "", "en"), (True, "zh/", "zh")):
                source = root / f"{prefix}index.md"
                source.parent.mkdir(parents=True, exist_ok=True)
                source.write_text(
                    f"---\ntitle: Fixture\nlang: {language}\n---\n"
                    "{% include components/link-directory.html %}\n"
                    "{% capture diagram_content %}A < B\n  → C{% endcapture %}\n"
                    '{% include components/diagram-frame.html tag="FLOW" title="A & B" content=diagram_content %}\n'
                    "[Guide]({% link index.md %})\n"
                )
                marker = "来源章节" if chinese else "SOURCE"
                bundle = root / ("llms-full-zh.txt" if chinese else "llms-full.txt")
                bundle.write_text(f"# Fixture\n\n---\n# {marker}: {prefix}index.md\n---\n\nOld.\n")
                with patch.object(GENERATOR, "ROOT", root):
                    first = GENERATOR.render(bundle, chinese)
                    with self.subTest(language=language):
                        self.assertIn(data["applications"][0][language]["title"], first)
                        self.assertIn("https://thefatcat.fun/belly", first)
                        self.assertIn("A & B", first)
                        self.assertIn("\n\u0060\u0060\u0060text\nA < B\n  → C\n\u0060\u0060\u0060", first)
                        self.assertNotIn("{%", first)
                        self.assertNotIn("{{", first)
                    data["applications"][0][language]["title"] = f"Updated {language} & entry"
                    data_path.write_text(json.dumps(data))
                    second = GENERATOR.render(bundle, chinese)
                    self.assertIn(f"Updated {language} & entry", second)
                    self.assertNotEqual(first, second)
            includes.joinpath("diagram-frame.html").unlink()
            with patch.object(GENERATOR, "ROOT", root):
                with self.assertRaises(subprocess.CalledProcessError):
                    GENERATOR.render(bundle, True)


if __name__ == "__main__":
    unittest.main()
