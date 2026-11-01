from pathlib import Path
import re
import sys


CONFIG_PATTERN = re.compile(
    r"(export\\s+const\\s+config\\s*=\\s*\\{)([\\s\\S]*?)(\\}\\s*;)",
)


def patch(path: Path) -> None:
    if not path.is_file():
        raise SystemExit(f"ERRO: função SEO não encontrada: {path}")

    source = path.read_text(encoding="utf-8")
    match = CONFIG_PATTERN.search(source)
    if not match:
        raise SystemExit("ERRO: configuração exportada da função SEO não encontrada.")

    body = match.group(2)
    if "robots.txt" not in body or "sitemap.xml" not in body:
        raise SystemExit("ERRO: rotas robots.txt e sitemap.xml não encontradas na função SEO.")

    preference = re.compile(r"\\bpreferStatic\\s*:\\s*(?:true|false)\\b")
    if preference.search(body):
        body = preference.sub("preferStatic: true", body, count=1)
        body = preference.sub("preferStatic: true", body)
    else:
        body = "\\n  preferStatic: true," + body

    patched = source[:match.start(2)] + body + source[match.end(2):]
    path.write_text(patched, encoding="utf-8")
    print("OK: função SEO configurada com preferStatic: true.")
    print("OK: ficheiros estáticos existentes têm prioridade sobre a função.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("netlify") / "functions" / "seo.mjs"
    patch(target)
