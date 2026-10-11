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

    def test_rejects_tool_with_only_manual_placeholder(self):
        import shutil
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            shutil.copytree(build.ROOT/'assets', root/'assets')
            shutil.copyfile(build.ROOT/'shortcuts.json', root/'shortcuts.json')
            atlas, _ = build.read_data()
            for row in atlas['rows']:
                if row['command'] == 'ffuf':
                    row['example'] = 'man ffuf'
            (root/'atlas_base.json').write_text(json.dumps(atlas))
            with self.assertRaisesRegex(ValueError, 'ffuf: somente manual'):
                build.read_data(root)

    def test_script_injection_is_escaped_and_data_preserved(self):
        data = {'example': '</script><script>alert(1)</script>', 'note': '\u2028\u2029'}
        encoded = build.inline_json(data)
        self.assertNotIn('</script>', encoded)
        self.assertEqual(json.loads(encoded), data)

    def test_worker_hashes_match_generated_files(self):
        import hashlib
        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder)
            build.build(out)
            worker = (out/'sw.js').read_text()
            for label, expected_count in [('CORE_MANIFEST', 5), ('EXTRAS_MANIFEST', 14)]:
                manifest = json.JSONDecoder().raw_decode(worker.split('const '+label+'=absoluteManifest(', 1)[1])[0]
                self.assertEqual(len(manifest), expected_count)
                for path, digest in manifest.items():
                    self.assertEqual(digest, hashlib.sha256((out/path).read_bytes()).hexdigest())

    def test_asset_change_changes_build_and_manifest(self):
        import shutil
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)/'source'
            root.mkdir()
            for path in ['src', 'assets', 'scripts']:
                shutil.copytree(build.ROOT/path, root/path)
            for name in ['atlas_base.json', 'shortcuts.json', 'LICENCA.md', 'Inter_OFL.txt', 'FiraCode_OFL.txt']:
                shutil.copyfile(build.ROOT/name, root/name)
            out = Path(folder)/'output'
            before = build.build(out, root)
            old_worker = (out/'sw.js').read_text()
            (root/'assets/corne-l0.webp').write_bytes(b'changed fixture bytes')
            self.assertNotEqual(before, build.build(out, root))
            self.assertNotEqual(old_worker, (out/'sw.js').read_text())

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

    def test_review_metadata_validation(self):
        atlas, shortcuts = build.read_data()
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root/'shortcuts.json').write_text(json.dumps(shortcuts))

            # Rejeita status desconhecido
            bad = copy.deepcopy(atlas)
            bad['rows'][0]['review_status'] = 'aprovado'
            (root/'atlas_base.json').write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError, 'review_status inválido'):
                build.read_data(root)

            # Rejeita data fora do padrão YYYY-MM-DD
            bad = copy.deepcopy(atlas)
            bad['rows'][0]['reviewed_on'] = '11/10/2026'
            (root/'atlas_base.json').write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError, 'reviewed_on inválido'):
                build.read_data(root)

            # Rejeita doc_ref inválido
            bad = copy.deepcopy(atlas)
            bad['rows'][0]['doc_ref'] = 'man:rm(1)'
            (root/'atlas_base.json').write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError, 'doc_ref inválido'):
                build.read_data(root)

            # Rejeita tested sem ambiente (tested_distros)
            bad = copy.deepcopy(atlas)
            bad['rows'][0]['review_status'] = 'tested'
            bad['rows'][0]['reviewed_on'] = '2026-10-11'
            (root/'atlas_base.json').write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError, 'registro tested requer tested_distros'):
                build.read_data(root)

            # Rejeita tested sem test_evidence
            bad['rows'][0]['tested_distros'] = ['Debian 12.7']
            (root/'atlas_base.json').write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError, 'registro tested requer test_evidence'):
                build.read_data(root)

            # Rejeita tested_distros quando status não for tested
            bad = copy.deepcopy(atlas)
            bad['rows'][0]['review_status'] = 'documented'
            bad['rows'][0]['tested_distros'] = ['Debian 12.7']
            (root/'atlas_base.json').write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError, 'tested_distros permitido somente quando'):
                build.read_data(root)

if __name__ == '__main__': unittest.main()
