from pathlib import Path
import re
import sys


CONFIG_PATTERN = re.compile(
    r"(export\s+const\s+config\s*=\s*\{)([\s\S]*?)(\}\s*;)",
)
PATH_PATTERN = re.compile(r"(\bpath\s*:\s*\[)([\s\S]*?)(\])")
STATIC_ROUTES = ("/robots.txt", "/sitemap.xml")
REQUIRED_DYNAMIC_ROUTES = ("/p/*", "/cursos", "/ver", "/bio", "/links")


def remove_route(array_body: str, route: str) -> str:
    quoted = r"""(["'])""" + re.escape(route) + r"""\1"""
    array_body, removed = re.subn(quoted + r"\s*,", "", array_body, count=1)
    if not removed:
        array_body, _ = re.subn(r",\s*" + quoted, "", array_body, count=1)
    return array_body


def patch(path: Path) -> None:
    if not path.is_file():
        raise SystemExit(f"ERRO: função SEO não encontrada: {path}")

    source = path.read_text(encoding="utf-8")
    config = CONFIG_PATTERN.search(source)
    if not config:
        raise SystemExit("ERRO: configuração exportada da função SEO não encontrada.")

    config_body = config.group(2)
    path_match = PATH_PATTERN.search(config_body)
    if not path_match:
        raise SystemExit("ERRO: lista de rotas da função SEO não encontrada.")

    routes = path_match.group(2)
    for route in STATIC_ROUTES:
        routes = remove_route(routes, route)

    for route in STATIC_ROUTES:
        if re.search(r"""["']""" + re.escape(route) + r"""["']""", routes):
            raise SystemExit(f"ERRO: rota estática ainda registada na função SEO: {route}")

    missing = [route for route in REQUIRED_DYNAMIC_ROUTES if route not in routes]
    if missing:
        raise SystemExit("ERRO: foram alteradas rotas dinâmicas necessárias: " + ", ".join(missing))

    patched_body = (
        config_body[:path_match.start(2)]
        + routes
        + config_body[path_match.end(2):]
    )
    patched = source[:config.start(2)] + patched_body + source[config.end(2):]
    path.write_text(patched, encoding="utf-8")
    print("OK: robots.txt e sitemap.xml removidos apenas do registo da função SEO.")
    print("OK: rotas dinâmicas /p, /cursos, /ver, /bio e /links preservadas.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("netlify") / "functions" / "seo.mjs"
    patch(target)
