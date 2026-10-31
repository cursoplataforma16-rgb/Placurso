const assert = require('assert');

require('./annan_execution_engine.js');
const Engine = global.PlacursoAnnanExecutionEngine;
assert.ok(Engine, 'execution engine must be exposed');

const created = Engine.create({ id: 'task-1', objective: 'prepare product', priority: 'high' });
assert.strictEqual(created.ok, true);
assert.strictEqual(created.task.status, 'pending');
assert.strictEqual(created.task.priority, 'high');

const duplicate = Engine.create({ id: 'task-1', objective: 'duplicate' });
assert.strictEqual(duplicate.ok, false);
assert.strictEqual(duplicate.reason, 'duplicate_task');

const invalid = Engine.create({ id: 'bad', objective: '' });
assert.strictEqual(invalid.ok, false);
assert.strictEqual(invalid.reason, 'invalid_objective');

const sensitive = Engine.create({ id: 'sensitive-1', objective: 'send payment', sensitive: true });
assert.strictEqual(sensitive.ok, true);
assert.strictEqual(Engine.start('sensitive-1').reason, 'approval_required');
assert.strictEqual(Engine.approve('sensitive-1').ok, true);
assert.strictEqual(Engine.start('sensitive-1').ok, true);
assert.strictEqual(Engine.complete('sensitive-1', { summary: 'done' }).ok, true);
assert.strictEqual(Engine.get('sensitive-1').status, 'completed');

const failed = Engine.create({ id: 'failed-1', objective: 'test failure' });
assert.strictEqual(Engine.start('failed-1').ok, true);
assert.strictEqual(Engine.fail('failed-1', 'adapter_unavailable').ok, true);
assert.strictEqual(Engine.get('failed-1').status, 'failed');

const unsafe = Engine.create({ id: 'unsafe-1', objective: 'api_key secret' });
assert.strictEqual(unsafe.ok, false);
assert.strictEqual(unsafe.reason, 'unsafe_task');

for (let i = 0; i < 130; i += 1) {
  Engine.create({ id: `bounded-${i}`, objective: `bounded task ${i}` });
}
assert.ok(Engine.list().length <= 120, 'history must be bounded');

console.log('Phase 9 execution engine contract passed.');
