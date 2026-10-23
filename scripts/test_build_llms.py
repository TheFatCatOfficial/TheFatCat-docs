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
    def write_catalog(self, root):
        data = {}
        for language, prefix in (("en", ""), ("zh", "zh/")):
            data[language] = {
                "index_title": "# Fixture index", "index_intro": "Index introduction.",
                "full_title": "# Fixture bundle", "full_intro": "All {chapter_count} chapters: {docs_url}",
                "full_link": {"section": "Full text", "title": "Full text", "description": "Every chapter."},
                "pages": [{"path": prefix + "index.md", "index": {
                    "section": "Guides", "title": "Fixture", "description": "A public guide.", "order": 0}}],
            }
        directory = root / "_data"
        directory.mkdir(exist_ok=True)
        (directory / "docs.json").write_text(json.dumps(data))

    def test_ai_usage_notice_stays_current_and_occurs_once(self):
        for chinese, language in ((False, "en"), (True, "zh")):
            with self.subTest(language=language):
                label = "AI 使用说明" if chinese else "AI usage"
                text = f"# Documentation\n\n> {label}: Outdated notice.\n\nOriginal content.\n"
                result = GENERATOR.with_ai_usage(text, chinese)
                self.assertIn(GENERATOR.AI_USAGE[language], result)
                self.assertNotIn("Outdated notice", result)
                self.assertTrue(result.endswith("Original content.\n"))
                self.assertEqual(result.count(f"> {label}:"), 1)
                self.assertEqual(result, GENERATOR.with_ai_usage(result, chinese))

    def test_ignored_dependency_pages_are_excluded_from_both_languages(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_catalog(root)
            for chinese, prefix in ((False, ""), (True, "zh/")):
                public_page = root / f"{prefix}index.md"
                public_page.parent.mkdir(parents=True, exist_ok=True)
                public_page.write_text("---\ntitle: Public guide\n---\nPublic guide content.\n")
                for directory in ("node_modules/package", "vendor/package", "_site", ".cache", "technical-docs", "whitepaper"):
                    ignored_page = root / f"{prefix}{directory}/guide.md"
                    ignored_page.parent.mkdir(parents=True, exist_ok=True)
                    ignored_page.write_text("---\ntitle: Dependency guide\n---\nDependency fixture content.\n")
                (root / f"{prefix}whitepaper.md").write_text("---\ntitle: Whitepaper\n---\nWithdrawn whitepaper.\n")
                marker = "来源章节" if chinese else "SOURCE"
                bundle = root / ("llms-full-zh.txt" if chinese else "llms-full.txt")
                bundle.write_text(f"# Fixture bundle\n\n---\n# {marker}: {prefix}node_modules/package/guide.md\n---\n\nOld section.\n")
                with patch.object(GENERATOR, "ROOT", root):
                    result = GENERATOR.render_full(chinese)
                with self.subTest(chinese=chinese):
                    self.assertIn(f"# {marker}: {prefix}index.md", result)
                    self.assertIn("Public guide content.", result)
                    self.assertNotIn("Dependency fixture content.", result)
                    self.assertNotIn("node_modules", result)
                    self.assertNotIn("technical-docs", result)
                    self.assertNotIn("whitepaper", result.lower())
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
            data_path.parent.mkdir(exist_ok=True)
            self.write_catalog(root)
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
                with patch.object(GENERATOR, "ROOT", root):
                    first = GENERATOR.render_full(chinese)
                    with self.subTest(language=language):
                        self.assertIn(data["applications"][0][language]["title"], first)
                        self.assertIn("https://thefatcat.fun/belly", first)
                        self.assertIn("A & B", first)
                        self.assertIn("\n\u0060\u0060\u0060text\nA < B\n  → C\n\u0060\u0060\u0060", first)
                        self.assertNotIn("{%", first)
                        self.assertNotIn("{{", first)
                    data["applications"][0][language]["title"] = f"Updated {language} & entry"
                    data_path.write_text(json.dumps(data))
                    second = GENERATOR.render_full(chinese)
                    self.assertIn(f"Updated {language} & entry", second)
                    self.assertNotEqual(first, second)
            includes.joinpath("diagram-frame.html").unlink()
            with patch.object(GENERATOR, "ROOT", root):
                with self.assertRaises(subprocess.CalledProcessError):
                    GENERATOR.render_full(True)

    def test_outputs_rebuild_without_previous_artifacts_and_share_the_catalog(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_catalog(root)
            for chinese, prefix in ((False, ""), (True, "zh/")):
                source = root / (prefix + "index.md")
                source.parent.mkdir(parents=True, exist_ok=True)
                source.write_text("---\ntitle: Fixture\n---\nPublic content.\n")
                with patch.object(GENERATOR, "ROOT", root):
                    full = GENERATOR.render_full(chinese)
                    index = GENERATOR.render_index(chinese)
                    self.assertIn("Public content.", full)
                    self.assertIn("[Fixture](", index)
                    self.assertIn(GENERATOR.public_url(prefix + "index.md"), full)
                    self.assertIn(GENERATOR.public_url(prefix + "index.md"), index)
                    for name in ("llms.txt", "llms-zh.txt", "llms-full.txt", "llms-full-zh.txt"):
                        (root / name).write_text("Corrupted old artifact")
                    self.assertEqual(GENERATOR.render_full(chinese), full)
                    self.assertEqual(GENERATOR.render_index(chinese), index)
                    extra = source.with_name("new-guide.md")
                    extra.write_text("---\ntitle: New guide\n---\nA new chapter.\n")
                    for render in (GENERATOR.render_full, GENERATOR.render_index):
                        with self.assertRaisesRegex(ValueError, "unlisted=.*new-guide"):
                            render(chinese)
                    extra.unlink()
                    source.unlink()
                    with self.assertRaisesRegex(ValueError, "missing=.*index.md"):
                        GENERATOR.render_index(chinese)


if __name__ == "__main__":
    unittest.main()
