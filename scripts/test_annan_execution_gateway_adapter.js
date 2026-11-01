const assert = require('assert');

require('./annan_execution_engine.js');
require('./annan_integration_gateway.js');
require('./annan_execution_gateway_adapter.js');

const Engine = global.PlacursoAnnanExecutionEngine;
const Gateway = global.PlacursoAnnanIntegrationGateway;
const Adapter = global.PlacursoAnnanExecutionGatewayAdapter;

assert.ok(Adapter, 'execution gateway adapter must be exposed');
assert.strictEqual(Adapter.version, '1.0');

assert.strictEqual(Gateway.register({ name: 'test-api', kind: 'api' }).ok, true);
const created = Engine.create({
  id: 'gateway-success-1',
  objective: 'prepare integration event',
  integration: 'test-api',
  eventType: 'product.ready',
  event: { type: 'product.ready', productId: 'p1' },
});
assert.strictEqual(created.ok, true);

const success = Adapter.execute('gateway-success-1');
assert.strictEqual(success.ok, true);
assert.strictEqual(success.status, 'completed');
assert.strictEqual(success.integration, 'test-api');
assert.strictEqual(Engine.get('gateway-success-1').status, 'completed');

const unknown = Engine.create({
  id: 'gateway-unknown-1',
  objective: 'unknown integration',
  integration: 'does-not-exist',
  event: { type: 'x' },
});
assert.strictEqual(unknown.ok, true);
const unknownResult = Adapter.execute('gateway-unknown-1');
assert.strictEqual(unknownResult.ok, false);
assert.strictEqual(unknownResult.reason, 'integration_unavailable');
assert.strictEqual(Engine.get('gateway-unknown-1').status, 'failed');

const sensitive = Engine.create({
  id: 'gateway-sensitive-1',
  objective: 'send sensitive action',
  integration: 'test-api',
  sensitive: true,
  event: { type: 'payment.requested' },
});
assert.strictEqual(sensitive.ok, true);
const blocked = Adapter.execute('gateway-sensitive-1');
assert.strictEqual(blocked.ok, false);
assert.strictEqual(blocked.reason, 'approval_required');
assert.strictEqual(Engine.get('gateway-sensitive-1').status, 'pending');
assert.strictEqual(Engine.approve('gateway-sensitive-1').ok, true);
assert.strictEqual(Adapter.execute('gateway-sensitive-1').ok, true);

const unsafe = Engine.create({
  id: 'gateway-unsafe-1',
  objective: 'unsafe event',
  integration: 'test-api',
  event: { type: 'x', token: 'api_key=secret' },
});
assert.strictEqual(unsafe.ok, false);
assert.strictEqual(unsafe.reason, 'unsafe_task');

const missing = Engine.create({
  id: 'gateway-missing-1',
  objective: 'missing integration',
  event: { type: 'x' },
});
assert.strictEqual(missing.ok, true);
const missingResult = Adapter.execute('gateway-missing-1');
assert.strictEqual(missingResult.ok, false);
assert.strictEqual(missingResult.reason, 'missing_integration');
assert.strictEqual(Engine.get('gateway-missing-1').status, 'pending');

console.log('Phase 9.2 execution gateway adapter contract passed.');
