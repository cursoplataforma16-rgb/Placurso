"""Junta a aplicação completa da Plataforma Curso (curso-app/) ao site gerado.

Corre depois do build principal. Não altera nada do que o build principal gerou,
salvo três pontos marcados:
  1. a função SEO passa a servir a aplicação completa em /cursos (antes servia a
     página inicial, e os links /cursos?produto=... e /cursos?aprender=1 não abriam nada);
  2. _redirects ganha as rotas da aplicação (vendor, /infoprodutos, /falar);
  3. _headers ganha regras só para a aplicação;
  4. o menu da página inicial ganha a ligação "Loja e aulas" para /cursos;
  5. a raiz (/) abre o Desafio do dia (curso-app/desafio.html); a aplicação fica em /cursos; a página inicial do build principal fica em /inicio.
Falha o build se um ficheiro da aplicação colidir com um ficheiro diferente já gerado.
"""
from __future__ import annotations

from pathlib import Path
import filecmp
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "curso-app"
PUBLIC = ROOT / "public"
SEO = ROOT / "netlify" / "functions" / "seo.mjs"

# Ficam na raiz com nomes próprios: a função SEO responde a /cursos/*, por isso
# nada da aplicação pode viver dentro de /cursos/ (a função ler-se-ia a si própria).
EM_RAIZ_COM_NOME = {"index.html": "cursos-app.html", "sw.js": "cursos-sw.js"}
# Vão para a raiz (a aplicação chama-os por endereço absoluto)
NA_RAIZ = [
    "vendor", "manifest-curso.json", "annan-online-bridge.js", "creative-studio.js",
    "creative-studio-ui.js", "annan-creative.js", "optimize-supabase-media.js",
    "privacidade-curso.html", "termos-curso.html", "curso-tiktok-icon-1024.png", "annan-drive", "psico.js",
    "annan-offline",
]

REDIRECTS = """
# Aplicação completa da Plataforma Curso (scripts/add_curso_app.py)
/vendor/supabase-js.js   https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2                          200
/vendor/jspdf.js         https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js                200
/vendor/pdf.js           https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js             200
/vendor/pdf.worker.js    https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js      200
/infoprodutos            /cursos            301
/infoprodutos/*          /cursos            301
/falar                   /cursos?falar=1    302
/inicio                  /inicio.html       200
"""

HEADERS = """
/cursos-sw.js
  Cache-Control: no-cache
/cursos-app.html
  Cache-Control: no-cache
  X-Robots-Tag: noindex
/annan-online-bridge.js
  Cache-Control: no-cache
"""

SEO_ANTES = "await fetch(new URL('/index.html',request.url)"
SEO_DEPOIS = "await fetch(new URL('/cursos-app.html',request.url)"


def copiar(origem: Path, destino: Path) -> None:
    if origem.is_dir():
        for f in origem.rglob("*"):
            if f.is_file():
                copiar(f, destino / f.relative_to(origem))
        return
    if destino.exists() and not filecmp.cmp(origem, destino, shallow=False):
        sys.exit(f"ERRO: {destino.relative_to(ROOT)} já existe e é diferente; não substituo.")
    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(origem, destino)


def main() -> None:
    if not PUBLIC.is_dir():
        sys.exit("ERRO: public/ não existe; corra primeiro o build principal.")
    for nome, novo in EM_RAIZ_COM_NOME.items():
        copiar(APP / nome, PUBLIC / novo)
    for nome in NA_RAIZ:
        copiar(APP / nome, PUBLIC / nome)

    red = PUBLIC / "_redirects"
    txt = red.read_text(encoding="utf-8") if red.exists() else ""
    if "scripts/add_curso_app.py" not in txt:
        red.write_text(txt.rstrip("\n") + "\n" + REDIRECTS, encoding="utf-8")

    hdr = PUBLIC / "_headers"
    txt = hdr.read_text(encoding="utf-8") if hdr.exists() else ""
    if "/cursos-sw.js" not in txt:
        hdr.write_text(txt.rstrip("\n") + "\n" + HEADERS, encoding="utf-8")

    seo = SEO.read_text(encoding="utf-8")
    if SEO_DEPOIS not in seo:
        if SEO_ANTES not in seo:
            sys.exit("ERRO: a função SEO mudou; não encontrei o ponto onde serve /cursos.")
        SEO.write_text(seo.replace(SEO_ANTES, SEO_DEPOIS, 1), encoding="utf-8")

    # A interface da Plataforma Curso abre na raiz (pedido do CEO, 22/11/2026).
    # A página inicial gerada pelo build principal fica guardada em /inicio.
    inicio = PUBLIC / "inicio.html"
    raiz = PUBLIC / "index.html"
    if not inicio.exists():
        shutil.move(raiz, inicio)
    # A entrada é o Desafio do dia (jogos de 60 s); a loja e as aulas ficam em /cursos.
    shutil.copy2(APP / "desafio.html", raiz)

    home = inicio
    h = home.read_text(encoding="utf-8")
    alvo = '<a href="#desafios">Desafios</a>'
    if 'href="/cursos">Loja e aulas<' not in h and alvo in h:
        home.write_text(h.replace(alvo, alvo + '<a href="/cursos">Loja e aulas</a>', 1), encoding="utf-8")

    print("OK: aplicação completa da Plataforma Curso em /cursos (loja, aulas, painel CEO, ANNAN Online, Casa do ANNAN).")


if __name__ == "__main__":
    main()
