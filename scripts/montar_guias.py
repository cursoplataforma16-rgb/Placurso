#!/usr/bin/env python3
"""Monta cada guia (curso-app/guias/<id>.json) no modelo único curso-app/guias/_modelo.html.
O motor de infoprodutos só tem de produzir o JSON no formato de docs/FORMATO_INFOPRODUTO.md."""
import json, pathlib, sys
pasta = pathlib.Path(__file__).resolve().parent.parent / 'curso-app' / 'guias'
modelo = (pasta / '_modelo.html').read_text(encoding='utf-8')
marca = '<script id="dados" type="application/json">{}</script>'
assert marca in modelo
PROIBIDO = ('dionuel', 'angola', 'luanda')
n = 0
for f in sorted(pasta.glob('*.json')):
    d = json.loads(f.read_text(encoding='utf-8'))
    txt = json.dumps(d, ensure_ascii=False)
    baixo = txt.lower()
    for p in PROIBIDO:
        if p in baixo: sys.exit(f'ERRO: {f.name} contém "{p}" (marca Plataforma Curso)')
    for parte in d.get('partes', []):
        for b in parte.get('blocos', []):
            if b.get('tipo') == 'quiz':
                for q in b['perguntas']:
                    assert 0 <= q['c'] < len(q['o']), f'{f.name}: resposta certa fora das opções'
    seguro = txt.replace('</', '<\\/')
    (pasta / f"{d['id']}.html").write_text(modelo.replace(marca, '<script id="dados" type="application/json">' + seguro + '</script>'), encoding='utf-8')
    n += 1
print(f'OK: {n} guia(s) montado(s)')
