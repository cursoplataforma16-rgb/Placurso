#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "scripts" / "annan_product_factory.js"


def run_node(payload):
    script = """
const fs = require('fs');
const factory = require(process.argv[1]);
const input = JSON.parse(process.argv[2]);
const result = factory.normalizeOpportunity(input);
process.stdout.write(JSON.stringify(result));
"""
    proc = subprocess.run(
        ["node", "-e", script, str(CORE), json.dumps(payload)],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    assert proc.returncode == 0, proc.stderr
    return json.loads(proc.stdout)


def test_core_exists():
    assert CORE.exists(), "ANNAN Product Factory core must exist"


def test_normalizes_supported_product():
    result = run_node({
        "id": "opp-001",
        "type": "ebook",
        "title": "Contabilidade para pequenos negócios",
        "audience": "pequenos empreendedores",
        "problem": "dificuldade em controlar entradas e saídas",
        "promise": "controlar o caixa com um método simples",
        "sources": ["survey:2026-10", "annan:learning-summary"],
    })
    assert result["valid"] is True
    assert result["brief"]["type"] == "ebook"
    assert result["brief"]["id"] == "opp-001"
    assert result["brief"]["sources"] == ["survey:2026-10", "annan:learning-summary"]


def test_rejects_unsupported_product_type():
    result = run_node({
        "id": "opp-002",
        "type": "social-network",
        "title": "X",
        "audience": "students",
        "problem": "Y",
        "promise": "Z",
        "sources": ["source-1"],
    })
    assert result["valid"] is False
    assert "unsupported-type" in result["errors"]


def test_requires_source_traceability():
    result = run_node({
        "id": "opp-003",
        "type": "calculator",
        "title": "Calculadora de margem",
        "audience": "empreendedores",
        "problem": "não sabem calcular margem",
        "promise": "calcular margem rapidamente",
        "sources": [],
    })
    assert result["valid"] is False
    assert "sources-required" in result["errors"]


def test_requires_problem_and_promise():
    result = run_node({
        "id": "opp-004",
        "type": "tool",
        "title": "Ferramenta",
        "audience": "empreendedores",
        "problem": "",
        "promise": "",
        "sources": ["source-1"],
    })
    assert result["valid"] is False
    assert "problem-required" in result["errors"]
    assert "promise-required" in result["errors"]


def test_stage_plan_is_deterministic_and_side_effect_free():
    payload = {
        "id": "opp-005",
        "type": "course",
        "title": "Curso de vendas",
        "audience": "microempresas",
        "problem": "baixa conversão",
        "promise": "melhorar o processo comercial",
        "sources": ["source-1"],
    }
    first = run_node(payload)
    second = run_node(payload)
    assert first == second
    assert first["valid"] is True
    assert first["plan"] == [
        "research",
        "outline",
        "draft",
        "quality-review",
        "pricing",
        "publication-readiness",
    ]


if __name__ == "__main__":
    for name, fn in globals().copy().items():
        if name.startswith("test_"):
            fn()
    print("ANNAN Product Factory contract tests passed")
