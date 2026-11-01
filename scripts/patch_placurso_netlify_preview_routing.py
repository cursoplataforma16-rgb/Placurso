from pathlib import Path
import sys

LEGACY_FUNCTION = (
    "function ehRotaCurso(){ return /^\\/(cursos|infoprodutos)(\\/.*)?$/.test(location.pathname) "
    "|| /^(www\\.)?(plataforma-?cu(rso)?|placurso)(-[a-z0-9]+)?\\./i.test(location.hostname); }"
)
UPDATED_FUNCTION = (
    "function ehRotaCurso(){ return /^\\/(cursos|infoprodutos)(\\/.*)?$/.test(location.pathname) "
    "|| /^(www\\.)?(plataforma-?cu(rso)?|placurso)(-[a-z0-9]+)?\\./i.test(location.hostname) "
    "|| /^(?:deploy-preview-\\d+|[a-z0-9][a-z0-9-]*)--placurso\\.netlify\\.app$/i.test(location.hostname); }"
)


def patch(source: str) -> str:
    if UPDATED_FUNCTION in source:
        return source
    occurrences = source.count(LEGACY_FUNCTION)
    if occurrences != 1:
        raise ValueError(
            "A função ehRotaCurso original não foi encontrada exactamente uma vez; "
            "recusada a alteração da rota principal."
        )
    return source.replace(LEGACY_FUNCTION, UPDATED_FUNCTION, 1)


def patch_file(path: Path) -> None:
    if not path.is_file():
        raise SystemExit(f"ERRO: homepage não encontrada para corrigir host routing: {path}")
    source = path.read_text(encoding="utf-8")
    try:
        updated = patch(source)
    except ValueError as error:
        raise SystemExit(f"ERRO: {error}")
    if updated != source:
        path.write_text(updated, encoding="utf-8")
    print("OK: Placurso reconhece o domínio principal e os Deploy Previews/branch previews do Netlify.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("index.html")
    patch_file(target)
