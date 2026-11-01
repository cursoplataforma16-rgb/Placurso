from pathlib import Path
import re
import sys


EXCLUDED_ROUTES = {"/robots.txt", "/sitemap.xml", "/cursos"}
REQUIRED_DYNAMIC_ROUTES = {"/p/*", "/cursos/*", "/ver", "/bio", "/links"}


def _skip_string(source: str, index: int) -> int:
    quote = source[index]
    index += 1
    escaped = False
    while index < len(source):
        char = source[index]
        if escaped:
            escaped = False
        elif char == "\\":
            escaped = True
        elif char == quote:
            return index + 1
        index += 1
    raise ValueError("String não terminada na configuração SEO")


def _matching_delimiter(source: str, opening: int, left: str, right: str) -> int:
    depth = 0
    index = opening
    line_comment = False
    block_comment = False

    while index < len(source):
        char = source[index]
        next_char = source[index + 1] if index + 1 < len(source) else ""

        if line_comment:
            if char == "\n":
                line_comment = False
            index += 1
            continue
        if block_comment:
            if char == "*" and next_char == "/":
                block_comment = False
                index += 2
            else:
                index += 1
            continue

        if char in ("'", '"', "`"):
            index = _skip_string(source, index)
            continue
        if char == "/" and next_char == "/":
            line_comment = True
            index += 2
            continue
        if char == "/" and next_char == "*":
            block_comment = True
            index += 2
            continue

        if char == left:
            depth += 1
        elif char == right:
            depth -= 1
            if depth == 0:
                return index
        index += 1

    raise ValueError(f"Delimitador {left}{right} não fechado na configuração SEO")


def _config_bounds(source: str) -> tuple[int, int]:
    match = re.search(r"\bexport\s+const\s+config\s*=\s*\{", source)
    if not match:
        raise ValueError("export const config = { não encontrado em seo.mjs")
    opening = source.find("{", match.start())
    return opening, _matching_delimiter(source, opening, "{", "}")


def _string_tokens(source: str, start: int, end: int):
    index = start
    while index < end:
        char = source[index]
        next_char = source[index + 1] if index + 1 < end else ""
        if char in ("'", '"'):
            token_start = index
            token_end = _skip_string(source, index)
            raw = source[index + 1:token_end - 1]
            value = re.sub(r"\\([\\'\"])", r"\1", raw)
            yield token_start, token_end, value
            index = token_end
            continue
        if char == "/" and next_char == "/":
            newline = source.find("\n", index + 2, end)
            index = end if newline < 0 else newline + 1
            continue
        if char == "/" and next_char == "*":
            close = source.find("*/", index + 2, end)
            index = end if close < 0 else close + 2
            continue
        index += 1


def configured_routes(source: str) -> set[str]:
    """Return only literal routes registered in export const config.path."""
    config_open, config_close = _config_bounds(source)
    body = source[config_open + 1:config_close]
    path_match = re.search(r"\bpath\s*:\s*\[", body)
    if not path_match:
        raise ValueError("config.path não encontrado na função SEO")

    array_open = body.find("[", path_match.start())
    array_close = _matching_delimiter(body, array_open, "[", "]")
    return {
        value
        for _, _, value in _string_tokens(body, array_open + 1, array_close)
    }


def _remove_array_route_entries(array_body: str) -> str:
    tokens = [
        (start, finish, value)
        for start, finish, value in _string_tokens(array_body, 0, len(array_body))
        if value in EXCLUDED_ROUTES
    ]

    for start, finish, _ in reversed(tokens):
        after = finish
        while after < len(array_body) and array_body[after].isspace():
            after += 1

        if after < len(array_body) and array_body[after] == ",":
            remove_start, remove_end = start, after + 1
        else:
            before = start - 1
            while before >= 0 and array_body[before].isspace():
                before -= 1
            if before >= 0 and array_body[before] == ",":
                remove_start, remove_end = before, finish
            else:
                remove_start, remove_end = start, finish

        array_body = array_body[:remove_start] + array_body[remove_end:]

    return array_body


def patch(source: str) -> str:
    config_open, config_close = _config_bounds(source)
    body = source[config_open + 1:config_close]

    path_match = re.search(r"\bpath\s*:\s*\[", body)
    if not path_match:
        raise ValueError("config.path não encontrado na função SEO")

    array_open = body.find("[", path_match.start())
    array_close = _matching_delimiter(body, array_open, "[", "]")
    array_body = body[array_open + 1:array_close]
    updated_array = _remove_array_route_entries(array_body)

    # Remove a opção global: o objectivo é excluir somente as duas rotas estáticas.
    updated_array_body_start = body[:array_open + 1]
    updated_body = (
        updated_array_body_start
        + updated_array
        + body[array_close:]
    )
    updated_body = re.sub(
        r"(?m)^\s*preferStatic\s*:\s*(?:true|false)\s*,?\s*",
        "",
        updated_body,
    )

    for route in EXCLUDED_ROUTES:
        if any(value == route for _, _, value in _string_tokens(updated_array, 0, len(updated_array))):
            raise ValueError(f"A rota ainda ficou registada na função SEO: {route}")

    for route in REQUIRED_DYNAMIC_ROUTES:
        if not any(value == route for _, _, value in _string_tokens(updated_array, 0, len(updated_array))):
            raise ValueError(f"Rota dinâmica necessária não preservada: {route}")

    return source[:config_open + 1] + updated_body + source[config_close:]


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
    print("OK: robots.txt, sitemap.xml e rota exacta /cursos removidos da função SEO.")
    print("OK: /cursos/* e restantes rotas dinâmicas preservadas; /cursos usa redirecionamento estático.")


if __name__ == "__main__":
    main()
