from __future__ import annotations

from pathlib import Path
import re
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "placurso-site-root.zip"
EXTRACTED = ROOT / ".site-extracted"
PUBLIC = ROOT / "public"

PATTERNS = {
    "DIONUEL_BRAND": re.compile(r"\bdionuel\b", re.IGNORECASE),
    "LEGACY_USUARIOS_TABLE": re.compile(
        r"(?:\.from\s*\(\s*['\"]usuarios['\"]\s*\)"
        r"|\bpublic\s*\.\s*usuarios\b"
        r"|\busuarios\s*:\s*autor_id\b)",
        re.IGNORECASE,
    ),
    "OLD_KUNICA_DOMAIN": re.compile(r"\bkunica\.netlify\.app\b", re.IGNORECASE),
    "OLD_DIONUEL_SUPABASE_HOST": re.compile(
        r"\boettkaytgkkbrjoaeiqu\.supabase\.co\b", re.IGNORECASE
    ),
    "LEGACY_BRAND_ASSET": re.compile(
        r"logo[-_]dionuel|dionuel\.(?:png|svg|webp|jpe?g)", re.IGNORECASE
    ),
    "DUAL_BRAND_ROUTER": re.compile(r"\behRotaCurso\s*\(", re.IGNORECASE),
}

TEXT_SUFFIXES = {
    ".html", ".htm", ".js", ".mjs", ".ts", ".css", ".json", ".xml",
    ".txt", ".md", ".toml", ".yml", ".yaml", ".webmanifest", ".svg",
}
TEXT_FILENAMES = {"_redirects"}
MAX_TEXT_FILE_BYTES = 8_000_000
MAX_FINDINGS_PER_CATEGORY = 120


def _empty_findings() -> dict[str, list[str]]:
    return {name: [] for name in PATTERNS}


def _record_text(
    findings: dict[str, list[str]], location: str, source: str
) -> None:
    lines = source.splitlines() or [source]
    for category, pattern in PATTERNS.items():
        if len(findings[category]) >= MAX_FINDINGS_PER_CATEGORY:
            continue
        for number, line in enumerate(lines, 1):
            if pattern.search(line):
                snippet = " ".join(line.strip().split())
                if len(snippet) > 260:
                    snippet = snippet[:257] + "..."
                findings[category].append(f"{location}:{number}: {snippet}")
                if len(findings[category]) >= MAX_FINDINGS_PER_CATEGORY:
                    break


def _record_path(findings: dict[str, list[str]], location: str) -> None:
    for category, pattern in PATTERNS.items():
        if pattern.search(location) and len(findings[category]) < MAX_FINDINGS_PER_CATEGORY:
            findings[category].append(f"{location}: legacy marker in file path")


def _decode_text(raw: bytes) -> str | None:
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return None


def audit_archive(path: Path = ARCHIVE) -> dict[str, list[str]]:
    if not path.is_file():
        raise SystemExit(f"Source bundle missing: {path}")

    findings = _empty_findings()
    with ZipFile(path) as archive:
        corrupt_member = archive.testzip()
        if corrupt_member:
            raise SystemExit(f"Corrupt source bundle member: {corrupt_member}")

        for member in archive.infolist():
            if member.is_dir():
                continue
            _record_path(findings, member.filename)
            if Path(member.filename).suffix.lower() not in TEXT_SUFFIXES and Path(member.filename).name not in TEXT_FILENAMES:
                continue
            if member.file_size > MAX_TEXT_FILE_BYTES:
                raise SystemExit(
                    f"Refusing to skip oversized source file: {member.filename}"
                )
            source = _decode_text(archive.read(member))
            if source is not None:
                _record_text(findings, member.filename, source)
    return findings


def audit_directory(path: Path, scope: str) -> dict[str, list[str]]:
    if not path.is_dir():
        raise SystemExit(f"{scope} directory missing: {path}")

    findings = _empty_findings()
    for file_path in sorted(path.rglob("*")):
        if not file_path.is_file():
            continue
        relative = file_path.relative_to(path).as_posix()
        _record_path(findings, relative)
        if file_path.suffix.lower() not in TEXT_SUFFIXES and file_path.name not in TEXT_FILENAMES:
            continue
        size = file_path.stat().st_size
        if size > MAX_TEXT_FILE_BYTES:
            raise SystemExit(
                f"Refusing to skip oversized {scope} file: {relative}"
            )
        source = _decode_text(file_path.read_bytes())
        if source is not None:
            _record_text(findings, f"{scope}/{relative}", source)
    return findings


def main() -> int:
    scopes = (
        ("original_source_bundle", audit_archive(ARCHIVE)),
        ("extracted_source", audit_directory(EXTRACTED, "extracted_source")),
        ("production_output", audit_directory(PUBLIC, "production_output")),
        ("netlify_function_output", audit_directory(ROOT / "netlify" / "functions", "netlify_function_output")),
    )
    total = 0
    for scope, findings in scopes:
        scope_total = sum(len(items) for items in findings.values())
        total += scope_total
        print(f"== {scope}: {scope_total} findings ==")
        for category, items in findings.items():
            if not items:
                continue
            print(f"-- {category}: {len(items)} --")
            for item in items[:20]:
                print(item)

    if total:
        print(
            f"BLOCKED: {total} legacy DIONUEL/source-schema markers remain. "
            "Do not publish until the Placurso source is independently isolated."
        )
        return 1

    print("Placurso source isolation audit: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
