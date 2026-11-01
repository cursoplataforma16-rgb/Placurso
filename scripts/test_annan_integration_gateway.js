const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(require('path').join(__dirname, 'annan_integration_gateway.js'), 'utf8');
const context = { globalThis: {} };
vm.runInNewContext(source, context);
const gateway = context.globalThis.PlacursoAnnanIntegrationGateway;
if (!gateway) throw new Error('gateway missing');

let result = gateway.register({ name: 'analytics', kind: 'analytics', version: '1' });
if (!result.ok) throw new Error('valid registration rejected');

result = gateway.dispatch('analytics', { type: 'page_view', source: 'placurso' });
if (!result.ok || result.event !== 'page_view') throw new Error('safe event rejected');

result = gateway.register({ name: 'bad', kind: 'api', apiKey: 'secret-value' });
if (result.ok || result.reason !== 'secret_like_value_rejected') throw new Error('secret boundary failed');

result = gateway.dispatch('missing', { type: 'x' });
if (result.ok || result.reason !== 'integration_unavailable') throw new Error('unknown integration accepted');


const growth = gateway.list().find((item) => item.name === 'placurso-growth');
if (!growth || growth.kind !== 'channel' || growth.version !== '10.2' || !growth.enabled) {
  throw new Error('ANNAN growth capability is not registered in the existing gateway');
}

result = gateway.dispatch('placurso-growth', { type: 'campaign.draft', source: 'growth-center' });
if (!result.ok || result.queued !== false || result.event !== 'campaign.draft') {
  throw new Error('safe growth capability event rejected or falsely marked as queued');
}

result = gateway.dispatch('placurso-growth', { type: 'publish', access_token: 'not-allowed' });
if (result.ok || result.reason !== 'unsafe_event') {
  throw new Error('growth gateway accepted a credential-bearing payload');
}

console.log('OK: Phase 8 gateway behavior');
