from html import escape
from pathlib import Path
import re
import sys

TITLE = "Placurso — cursos práticos, ferramentas e aprendizagem com ANNAN"
DESCRIPTION = (
    "Formação prática, cursos e ferramentas digitais gratuitas para aprender, "
    "aplicar e crescer. Estude no telemóvel com orientação do ANNAN."
)
CANONICAL = "https://placurso.netlify.app/"
OG_IMAGE = "https://placurso.netlify.app/curso-og.png"


def _set_single(pattern: re.Pattern, replacement: str, source: str) -> str:
    matches = list(pattern.finditer(source))
    if len(matches) > 1:
        for match in reversed(matches[1:]):
            source = source[:match.start()] + source[match.end():]
        matches = list(pattern.finditer(source))
    if matches:
        match = matches[0]
        return source[:match.start()] + replacement + source[match.end():]
    return source.replace("</head>", replacement + "\\n</head>", 1)


def patch(path: Path) -> None:
    if not path.is_file():
        raise SystemExit(f"ERRO: ficheiro HTML não encontrado: {path}")
    source = path.read_text(encoding="utf-8")
    head_match = re.search(r"<head\\b[^>]*>[\\s\\S]*?</head>", source, re.IGNORECASE)
    if not head_match:
        raise SystemExit("ERRO: <head> não encontrado na homepage.")

    head = head_match.group(0)
    title_pattern = re.compile(r"<title\\b[^>]*>[\\s\\S]*?</title>", re.IGNORECASE)
    if len(list(title_pattern.finditer(head))) != 1:
        raise SystemExit("ERRO: a homepage deve ter exactamente um <title>.")
    head = title_pattern.sub(f"<title>{escape(TITLE)}</title>", head, count=1)

    description_pattern = re.compile(
        r"<meta\\s+name=[\\\"']description[\\\"'][^>]*>",
        re.IGNORECASE,
    )
    if len(list(description_pattern.finditer(head))) != 1:
        raise SystemExit("ERRO: a homepage deve ter exactamente uma meta description.")
    description_tag = (
        f'<meta name="description" content="{escape(DESCRIPTION, quote=True)}">'
    )
    head = description_pattern.sub(description_tag, head, count=1)

    canonical_tag = f'<link rel="canonical" href="{escape(CANONICAL, quote=True)}">'
    canonical_pattern = re.compile(
        r"""<link\\b(?=[^>]*\\brel=["']canonical["'])[^>]*>""",
        re.IGNORECASE,
    )
    head = _set_single(canonical_pattern, canonical_tag, head)

    social_tags = [
        (r"""<meta\\s+property=["']og:site_name["'][^>]*>""", '<meta property="og:site_name" content="Plataforma Curso">'),
        (r"""<meta\\s+property=["']og:type["'][^>]*>""", '<meta property="og:type" content="website">'),
        (r"""<meta\\s+property=["']og:title["'][^>]*>""", f'<meta property="og:title" content="{escape(TITLE, quote=True)}">'),
        (r"""<meta\\s+property=["']og:description["'][^>]*>""", f'<meta property="og:description" content="{escape(DESCRIPTION, quote=True)}">'),
        (r"""<meta\\s+property=["']og:url["'][^>]*>""", f'<meta property="og:url" content="{escape(CANONICAL, quote=True)}">'),
        (r"""<meta\\s+property=["']og:image["'][^>]*>""", f'<meta property="og:image" content="{escape(OG_IMAGE, quote=True)}">'),
        (r"""<meta\\s+name=["']twitter:card["'][^>]*>""", '<meta name="twitter:card" content="summary_large_image">'),
    ]
    for pattern_text, tag in social_tags:
        head = _set_single(re.compile(pattern_text, re.IGNORECASE), tag, head)

    source = source[:head_match.start()] + head + source[head_match.end():]
    path.write_text(source, encoding="utf-8")
    print("OK: metadados SEO da homepage alinhados com a Plataforma Curso.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("index.html")
    patch(target)
