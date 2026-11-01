from __future__ import annotations

from collections import Counter
from pathlib import Path
import re
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "placurso-site-root.zip"

PATTERNS = {
    "DIONUEL_BRAND": re.compile(r"dionuel", re.IGNORECASE),
    "LEGACY_USUARIOS_TABLE": re.compile(r"(?:public\\s*\\.\\s*)?usuarios", re.IGNORECASE),
    "OLD_KUNICA_DOMAIN": re.compile(r"kunica\\.netlify\\.app", re.IGNORECASE),
    "OLD_DIONUEL_SUPABASE_HOST": re.compile(r"oettkaytgkkbrjoaeiqu\\.supabase\\.co", re.IGNORECASE),
    "LEGACY_BRAND_ASSET": re.compile(r"logo[-_]dionuel|dionuel\\.(?:png|svg|webp|jpg)", re.IGNORECASE),
}
TEXT_SUFFIXES = {".html", ".htm", ".js", ".mjs", ".ts", ".css", ".json", ".xml", ".txt", ".md", ".toml", ".yml", ".yaml", ".webmanifest"}


def audit_archive(path: Path = ARCHIVE) -> dict[str, list[str]]:
    if not path.is_file():
        raise SystemExit(f"Source bundle missing: {path}")
    findings: dict[str, list[str]] = {name: [] for name in PATTERNS}
    with ZipFile(path) as archive:
        bad = archive.testzip()
        if bad:
            raise SystemExit(f"Corrupt source bundle member: {bad}")
        for member in archive.infolist():
            suffix = Path(member.filename).suffix.lower()
            if member.is_dir() or suffix not in TEXT_SUFFIXES or member.file_size > 8_000_000:
                continue
            raw = archive.read(member)
            try:
                source = raw.decode("utf-8")
            except UnicodeDecodeError:
                source = raw.decode("utf-8", errors="ignore")
            lines = source.splitlines()
            for name, pattern in PATTERNS.items():
                for number, line in enumerate(lines, 1):
                    if pattern.search(line):
                        snippet = line.strip().replace("\\t", " ")
                        if len(snippet) > 260:
                            snippet = snippet[:257] + "..."
                        findings[name].append(f"{member.filename}:{number}: {snippet}")
                        if len(findings[name]) >= 80:
                            break
    return findings


if __name__ == "__main__":
    results = audit_archive()
    total = sum(len(items) for items in results.values())
    print(f"Placurso source bundle audit: {total} findings")
    for name, items in results.items():
        print(f"== {name}: {len(items)} ==")
        for item in items:
            print(item)
    print("Audit mode: informational; no source files changed.")
