from pathlib import Path
from urllib.parse import urlsplit
import sys

STATIC_SEO_ROUTES = {"/robots.txt", "/sitemap.xml"}


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
        if source_path(line) not in STATIC_SEO_ROUTES
    ]

    if kept != lines:
        path.write_text("\n".join(kept) + ("\n" if original.endswith("\n") else ""), encoding="utf-8")

    removed = len(lines) - len(kept)
    print(f"OK: {removed} encaminhamento(s) directo(s) de robots/sitemap removido(s).")
    print("OK: robots.txt e sitemap.xml são servidos pelos ficheiros estáticos.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public") / "_redirects"
    patch(target)
