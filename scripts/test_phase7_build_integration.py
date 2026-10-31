#!/usr/bin/env python3
"""Ensure the ANNAN Product Factory ships inside the existing Placurso engine."""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
BUILDER = ROOT / "scripts" / "build_netlify.py"
FACTORY = ROOT / "scripts" / "annan_product_factory.js"

builder = BUILDER.read_text(encoding="utf-8")
factory = FACTORY.read_text(encoding="utf-8")

assert "annan_product_factory.js" in builder, (
    "Netlify build must include the Product Factory in the existing ANNAN runtime"
)
assert "PLACURSO_ANNAN_PRODUCT_FACTORY" in builder, (
    "Build must mark the Product Factory integration to prevent silent omission"
)
assert "PlacursoAnnanProductFactory" in factory, (
    "Product Factory must expose its API to the existing browser runtime"
)

# The exact build must keep the generated engine syntactically valid.
with subprocess.Popen(
    [sys.executable, str(BUILDER)],
    cwd=ROOT,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
) as proc:
    output, _ = proc.communicate()
    if proc.returncode != 0:
        raise SystemExit(output)

generated = ROOT / "public" / "psico-engine.js"
assert generated.is_file(), "Netlify build must emit public/psico-engine.js"
engine = generated.read_text(encoding="utf-8")
assert "PLACURSO_ANNAN_PRODUCT_FACTORY" in engine, (
    "The generated ANNAN engine must contain the Product Factory module"
)
assert "PlacursoAnnanProductFactory" in engine, (
    "The generated ANNAN engine must expose the Product Factory API"
)
print("Phase 7 build integration passed")
