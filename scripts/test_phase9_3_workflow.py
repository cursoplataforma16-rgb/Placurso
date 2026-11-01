#!/usr/bin/env python3
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / 'scripts' / 'annan_execution_engine.js'
WORKFLOW = ROOT / 'scripts' / 'annan_autonomous_workflow.js'


def run_node(script: str):
    return subprocess.run(['node', '-e', script], cwd=ROOT, text=True, capture_output=True)


def test_workflow_contract_exists_and_is_executable():
    assert WORKFLOW.exists()
    result = run_node(f"require({json.dumps(str(WORKFLOW))}); console.log(typeof globalThis.PlacursoAnnanAutonomousWorkflow)")
    assert result.returncode == 0, result.stderr
    assert 'object' in result.stdout


def test_workflow_runs_sequential_tasks_and_stops_on_failure():
    script = f"""
const fs=require('fs'), vm=require('vm');
vm.runInThisContext(fs.readFileSync({json.dumps(str(ENGINE))}, 'utf8'));
vm.runInThisContext(fs.readFileSync({json.dumps(str(WORKFLOW))}, 'utf8'));
const W=globalThis.PlacursoAnnanAutonomousWorkflow;
const E=globalThis.PlacursoAnnanExecutionEngine;
const r=W.run({id:'wf-1', objective:'test flow', tasks:[
  {{id:'step-1', objective:'first'}},
  {{id:'step-2', objective:'second', fail:true}},
  {{id:'step-3', objective:'third'}}
]}});
if(!r.ok || r.status!=='failed' || r.completed!==1 || r.failed!==1 || r.skipped!==1) process.exit(1);
if(E.get('wf-1:step-3')!==null) process.exit(1);
console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr
    assert 'ok' in result.stdout


def test_sensitive_workflow_requires_approval_before_execution():
    script = f"""
const fs=require('fs'), vm=require('vm');
vm.runInThisContext(fs.readFileSync({json.dumps(str(ENGINE))}, 'utf8'));
vm.runInThisContext(fs.readFileSync({json.dumps(str(WORKFLOW))}, 'utf8'));
const W=globalThis.PlacursoAnnanAutonomousWorkflow;
const r=W.run({id:'wf-2', objective:'sensitive flow', sensitive:true, tasks:[{{id:'step-1', objective:'protected'}}]}});
if(r.ok || r.reason!=='approval_required') process.exit(1);
console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr
    assert 'ok' in result.stdout


def test_approved_sensitive_workflow_can_execute_and_verify():
    script = f"""
const fs=require('fs'), vm=require('vm');
vm.runInThisContext(fs.readFileSync({json.dumps(str(ENGINE))}, 'utf8'));
vm.runInThisContext(fs.readFileSync({json.dumps(str(WORKFLOW))}, 'utf8'));
const W=globalThis.PlacursoAnnanAutonomousWorkflow;
const r=W.run({id:'wf-3', objective:'approved sensitive flow', sensitive:true, approved:true, tasks:[{{id:'step-1', objective:'protected'}}]}});
if(!r.ok || r.status!=='completed' || r.completed!==1 || r.results[0].verified!==true) process.exit(1);
console.log('ok');
"""
    result = run_node(script)
    assert result.returncode == 0, result.stderr
    assert 'ok' in result.stdout
