from pathlib import Path
from urllib.parse import urlsplit
import sys

STATIC_SEO_ROUTES = {"/robots.txt", "/sitemap.xml"}
COURSE_ROUTES = {"/cursos", "/cursos/"}
COURSE_FALLBACKS = [
    "/cursos /cursos/index.html 200!",
    "/cursos/ /cursos/index.html 200!",
]


def source_path(line: str) -> str | None:
    fields = line.split()
    if len(fields) < 2 or fields[0].startswith("#"):
        return None
    return urlsplit(fields[0]).path


def patch(path: Path) -> None:
    if not path.is_file():
        raise SystemExit(f"ERRO: ficheiro _redirects não encontrado: {path}")

    original = path.read_text(encoding="utf-8")
    lines = original.splitlines()
    kept = [
        line
        for line in lines
        if source_path(line) not in STATIC_SEO_ROUTES | COURSE_ROUTES
    ]

    # O exacto /cursos usa o app shell já servido pela rota dinâmica /cursos/*.
    result = COURSE_FALLBACKS + kept
    if result != lines:
        path.write_text("\n".join(result) + ("\n" if original.endswith("\n") or result else ""), encoding="utf-8")

    removed = len(lines) - len(kept)
    print(f"OK: {removed} redireccionamento(s) antigo(s) de robots/sitemap/cursos removido(s).")
    print("OK: robots.txt e sitemap.xml servidos como ficheiros estáticos.")
    print("OK: /cursos e /cursos/ encaminhados para /cursos/index.html.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public") / "_redirects"
    patch(target)
