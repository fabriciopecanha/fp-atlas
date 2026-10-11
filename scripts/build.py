#!/usr/bin/env python3
"""Valide os JSONs canônicos e gere o site e o pacote offline, sem dependências."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import re
import shutil
import urllib.parse
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def is_valid_iso_date(val):
    if not isinstance(val, str) or not re.match(r'^\d{4}-\d{2}-\d{2}$', val):
        return False
    try:
        datetime.date.fromisoformat(val)
        return True
    except (ValueError, TypeError):
        return False


def is_valid_url(val):
    if not isinstance(val, str):
        return False
    try:
        parsed = urllib.parse.urlparse(val)
        return parsed.scheme in ('http', 'https') and bool(parsed.netloc)
    except Exception:
        return False


def read_data(root=ROOT):
    atlas = json.loads((root / 'atlas_base.json').read_text(encoding='utf-8'))
    shortcuts = json.loads((root / 'shortcuts.json').read_text(encoding='utf-8'))
    require(isinstance(atlas, dict) and isinstance(atlas.get('rows'), list) and atlas['rows'], 'atlas_base.json precisa de rows não vazio')
    require(isinstance(shortcuts, list) and shortcuts, 'shortcuts.json precisa de uma lista não vazia')
    for label, rows, fields in [
        ('Linux', atlas['rows'], ['id', 'vol', 'section', 'command', 'name', 'purpose', 'example', 'notes', 'risk', 'source']),
        ('Atalhos', shortcuts, ['id', 'platform', 'group', 'context', 'source', 'keys', 'title', 'note']),
    ]:
        seen = set()
        for i, row in enumerate(rows):
            require(isinstance(row, dict), f'{label}: registro {i} inválido')
            require(all(k in row for k in fields), f'{label}: registro {i} com campos ausentes')
            ident = row['id']
            require(isinstance(ident, str) and ident and ident not in seen, f'{label}: id ausente/duplicado em {i}')
            seen.add(ident)
            require(row.get('kind', 'recipe') in ('recipe', 'catalog'), f'{label}: kind inválido em {ident}')
            for key in fields:
                if key == 'vol':
                    require(type(row[key]) is int and 1 <= row[key] <= 8, f'{label}: volume inválido em {ident}')
                else:
                    require(isinstance(row[key], str), f'{label}: {key} precisa ser texto em {ident}')
            if label == 'Atalhos':
                require(row['platform'] in ('linux', 'mac'), f'Plataforma inválida em {ident}')
            require(row['source'] == '' or is_valid_url(row['source']) or label == 'Linux', f'Fonte inválida em {ident}')
            if label == 'Linux':
                status = row.get('review_status', 'pending')
                require(status in ('pending', 'documented', 'tested'), f'{label}: review_status inválido em {ident}: {status}')
                reviewed_on = row.get('reviewed_on')
                if reviewed_on is not None:
                    require(is_valid_iso_date(reviewed_on), f'{label}: reviewed_on inválido em {ident}: {reviewed_on}')
                doc_ref = row.get('doc_ref')
                if doc_ref is not None:
                    require(is_valid_url(doc_ref), f'{label}: doc_ref inválido em {ident}: {doc_ref}')
                tested_distros = row.get('tested_distros')
                test_evidence = row.get('test_evidence')
                if status == 'documented':
                    require(reviewed_on is not None and is_valid_iso_date(reviewed_on),
                            f'{label}: registro documented requer reviewed_on com data válida em {ident}')
                    require(doc_ref is not None and is_valid_url(doc_ref),
                            f'{label}: registro documented requer doc_ref com URL válida em {ident}')
                    require(tested_distros is None or tested_distros == [],
                            f'{label}: tested_distros permitido somente quando review_status="tested" em {ident}')
                    require(test_evidence is None or test_evidence == {},
                            f'{label}: test_evidence permitido somente quando review_status="tested" em {ident}')
                elif status == 'tested':
                    require(reviewed_on is not None and is_valid_iso_date(reviewed_on),
                            f'{label}: registro tested requer reviewed_on com data válida em {ident}')
                    require(doc_ref is not None and is_valid_url(doc_ref),
                            f'{label}: registro tested requer doc_ref com URL válida em {ident}')
                    require(isinstance(tested_distros, list) and len(tested_distros) > 0 and all(isinstance(d, str) and d.strip() for d in tested_distros),
                            f'{label}: registro tested requer tested_distros não-vazio com nomes em texto em {ident}')
                    require(isinstance(test_evidence, dict),
                            f'{label}: registro tested requer test_evidence como objeto em {ident}')
                    for ef in ('environment', 'tool_version', 'kernel', 'command', 'expected', 'observed', 'log_ref'):
                        val = test_evidence.get(ef)
                        require(isinstance(val, str) and bool(val.strip()),
                                f'{label}: test_evidence.{ef} deve ser texto não vazio em {ident}')
                else:
                    require(tested_distros is None or tested_distros == [],
                            f'{label}: tested_distros permitido somente quando review_status="tested" em {ident}')
                    require(test_evidence is None or test_evidence == {},
                            f'{label}: test_evidence permitido somente quando review_status="tested" em {ident}')
    require({r['vol'] for r in atlas['rows']} == set(range(1, 9)), 'Os oito volumes precisam estar presentes')
    require({r['platform'] for r in shortcuts} == {'mac', 'linux'}, 'As duas plataformas precisam estar presentes')
    tools = {}
    for row in atlas['rows']:
        if row.get('kind') != 'catalog':
            tools.setdefault(row['command'], []).append(row)
    for command, rows in tools.items():
        if command != 'man':
            require(not all(re.match(r'^man\s+', r['example'].strip()) for r in rows), f'{command}: somente manual, falta receita ou marcação de catálogo')
    for model in ('corne', 'sofle'):
        for layer in range(6):
            require((root / 'assets' / f'{model}-l{layer}.webp').is_file(), f'Prévia ausente: {model} L{layer}')
    for name in ('manual-v21.pdf', 'adesivos-v21.pdf', 'icon-180.png', 'icon-192.png', 'icon-512.png'):
        require((root / 'assets' / name).is_file(), f'Asset ausente: {name}')
    return atlas, shortcuts


def inline_json(data):
    # Impede que conteúdo dos dados encerre o elemento script.
    return json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


def build(output, root=ROOT):
    atlas, shortcuts = read_data(root)
    template = (root / 'src/index.template.html').read_text(encoding='utf-8')
    sources = {name: (root / 'src' / name).read_text(encoding='utf-8') for name in ('app.js', 'pwa.js', 'style.css', 'sw.js')}
    digest = hashlib.sha256()
    for name in ['atlas_base.json', 'shortcuts.json', 'src/index.template.html', 'src/app.js', 'src/pwa.js', 'src/style.css', 'src/sw.js', 'src/manifest.webmanifest', 'scripts/build.py']:
        digest.update(name.encode()); digest.update((root / name).read_bytes())
    for p in sorted((root / 'assets').rglob('*')):
        if p.is_file():
            digest.update(str(p.relative_to(root)).encode()); digest.update(p.read_bytes())
    version = digest.hexdigest()[:12]
    replacements = {
        '{{DATA_DECLARATIONS}}': 'const ATLAS_DATA=' + inline_json(atlas) + ';\nconst SHORTCUTS=' + inline_json(shortcuts) + ';',
        '{{APP_JS}}': sources['app.js'], '{{PWA_JS}}': sources['pwa.js'].replace('{{BUILD_ID}}', version), '{{STYLE_CSS}}': sources['style.css'],
    }
    for key, value in replacements.items():
        require(template.count(key) == 1, f'Marcador ausente/duplicado: {key}')
        template = template.replace(key, value)
    require(not re.search(r'\{\{(?:DATA_DECLARATIONS|APP_JS|PWA_JS|STYLE_CSS|BUILD_ID)\}\}', template), 'Marcador não resolvido')
    output.mkdir(parents=True, exist_ok=True)
    (output / 'index.html').write_text(template, encoding='utf-8')
    shutil.copyfile(root / 'src/manifest.webmanifest', output / 'manifest.webmanifest')
    shutil.copytree(root / 'assets', output / 'assets', dirs_exist_ok=True)
    extras = [f'assets/{model}-l{layer}.webp' for model in ('corne', 'sofle') for layer in range(6)] + ['assets/manual-v21.pdf', 'assets/adesivos-v21.pdf']
    core = ['index.html', 'manifest.webmanifest', 'assets/icon-180.png', 'assets/icon-192.png', 'assets/icon-512.png']
    worker = sources['sw.js']
    for marker, paths in [('{{EXTRAS_MANIFEST}}', extras), ('{{CORE_MANIFEST}}', core)]:
        require(worker.count(marker) == 1, f'Marcador ausente/duplicado: {marker}')
        manifest = {p: hashlib.sha256((output / p).read_bytes()).hexdigest() for p in paths}
        worker = worker.replace(marker, inline_json(manifest))
    (output / 'sw.js').write_text(worker.replace('{{BUILD_ID}}', version), encoding='utf-8')
    for name in ('LICENCA.md', 'Inter_OFL.txt', 'FiraCode_OFL.txt'):
        shutil.copyfile(root / name, output / name)
    (output / '.nojekyll').write_text('')
    # Pacote público completo para consultar sem internet, extraindo a pasta.
    with zipfile.ZipFile(output / 'fp-atlas-offline.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for p in sorted(output.rglob('*')):
            if p.is_file() and p.name != 'fp-atlas-offline.zip':
                info = zipfile.ZipInfo(str(p.relative_to(output)), date_time=(2026, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, p.read_bytes())
    print(json.dumps({'linux': len(atlas['rows']), 'atalhos': len(shortcuts), 'build': version, 'html_bytes': (output / 'index.html').stat().st_size}, ensure_ascii=False))
    return version


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    parser.add_argument('--validate-only', action='store_true')
    args = parser.parse_args()
    if args.validate_only:
        read_data(); print('Dados e assets válidos.')
    else:
        build(args.output.resolve())
