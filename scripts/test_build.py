import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('build', Path(__file__).with_name('build.py'))
build = importlib.util.module_from_spec(spec); spec.loader.exec_module(build)

class BuildTests(unittest.TestCase):
    def test_current_data_and_counts(self):
        atlas, shortcuts = build.read_data()
        self.assertGreaterEqual(len(atlas['rows']), 2653)
        self.assertGreaterEqual(len(shortcuts), 117)

    def test_rejects_duplicate_ids(self):
        atlas, shortcuts = build.read_data()
        atlas['rows'][1]['id'] = atlas['rows'][0]['id']
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root/'atlas_base.json').write_text(json.dumps(atlas))
            (root/'shortcuts.json').write_text(json.dumps(shortcuts))
            with self.assertRaisesRegex(ValueError, 'duplicado'):
                build.read_data(root)

    def test_rejects_invalid_volume(self):
        atlas, shortcuts = build.read_data()
        atlas['rows'][0]['vol'] = 9
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root/'atlas_base.json').write_text(json.dumps(atlas))
            (root/'shortcuts.json').write_text(json.dumps(shortcuts))
            with self.assertRaisesRegex(ValueError, 'volume inválido'):
                build.read_data(root)

    def test_script_injection_is_escaped_and_data_preserved(self):
        data = {'example': '</script><script>alert(1)</script>', 'note': '\u2028\u2029'}
        encoded = build.inline_json(data)
        self.assertNotIn('</script>', encoded)
        self.assertEqual(json.loads(encoded), data)

    def test_generation_is_deterministic_and_offline_package_complete(self):
        import zipfile
        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder)
            first = build.build(out)
            html = (out/'index.html').read_bytes(); package = (out/'fp-atlas-offline.zip').read_bytes()
            self.assertEqual(first, build.build(out))
            self.assertEqual(html, (out/'index.html').read_bytes())
            self.assertEqual(package, (out/'fp-atlas-offline.zip').read_bytes())
            with zipfile.ZipFile(out/'fp-atlas-offline.zip') as z:
                self.assertIn('assets/manual-v21.pdf', z.namelist())
                self.assertIn('assets/sofle-l5.webp', z.namelist())
                self.assertIn('index.html', z.namelist())
            text=html.decode()
            for label, filename in [('ATLAS_DATA','atlas_base.json'),('SHORTCUTS','shortcuts.json')]:
                data=json.JSONDecoder().raw_decode(text.split('const '+label+'=',1)[1])[0]
                self.assertEqual(data, json.loads((build.ROOT/filename).read_text()))

if __name__ == '__main__': unittest.main()
