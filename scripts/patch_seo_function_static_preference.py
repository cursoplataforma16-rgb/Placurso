from pathlib import Path
import re
import sys


def _config_bounds(source: str) -> tuple[int, int]:
    match = re.search(r"\bexport\s+const\s+config\s*=\s*\{", source)
    if not match:
        raise ValueError("export const config = { não encontrado em seo.mjs")

    opening = source.find("{", match.start())
    depth = 0
    quote = None
    escaped = False
    line_comment = False
    block_comment = False
    i = opening

    while i < len(source):
        char = source[i]
        next_char = source[i + 1] if i + 1 < len(source) else ""

        if line_comment:
            if char == "\n":
                line_comment = False
            i += 1
            continue
        if block_comment:
            if char == "*" and next_char == "/":
                block_comment = False
                i += 2
            else:
                i += 1
            continue
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            i += 1
            continue

        if char == "/" and next_char == "/":
            line_comment = True
            i += 2
            continue
        if char == "/" and next_char == "*":
            block_comment = True
            i += 2
            continue
        if char in ("'", '"' , chr(96)):
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return opening, i
        i += 1

    raise ValueError("Objecto de configuração do seo.mjs não foi fechado")


def patch(source: str) -> str:
    opening, closing = _config_bounds(source)
    body = source[opening + 1:closing]

    if "robots.txt" not in body or "sitemap.xml" not in body:
        raise ValueError(
            "A configuração SEO não contém simultaneamente as rotas robots.txt e sitemap.xml"
        )

    existing = re.search(r"\bpreferStatic\s*:\s*(true|false)\b", body)
    if existing:
        body = body[:existing.start(1)] + "true" + body[existing.end(1):]
    elif re.search(r"\bpreferStatic\s*:", body):
        raise ValueError("preferStatic já existe com um valor não literal; revisão manual necessária")
    else:
        body = "\n  preferStatic: true," + body

    updated = source[:opening + 1] + body + source[closing:]
    if len(re.findall(r"\bpreferStatic\s*:\s*true\b", updated)) != 1:
        raise ValueError("Não foi possível garantir um único preferStatic: true")
    return updated


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("netlify/functions/seo.mjs")
    if not path.is_file():
        raise SystemExit(f"ERRO: função SEO não encontrada: {path}")
    source = path.read_text(encoding="utf-8")
    try:
        updated = patch(source)
    except ValueError as error:
        raise SystemExit(f"ERRO: {error}")
    path.write_text(updated, encoding="utf-8")
    print("OK: Netlify SEO function agora prioriza ficheiros estáticos existentes.")


if __name__ == "__main__":
    main()
