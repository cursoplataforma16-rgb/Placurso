'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function main() {
  let currentUser = null;
  let requireEmailConfirmation = false;
  let failNextUpsert = false;
  let signupPayload = null;
  let signinPayload = null;
  const learningEvents = [];
  const profiles = new Map();
  const listeners = {};
  const store = new Map();

  const auth = {
    async getUser() {
      return { data: { user: currentUser }, error: null };
    },
    async signUp(payload) {
      signupPayload = payload;
      const user = { id: 'student-1', email: payload.email, user_metadata: payload.options.data };
      if (requireEmailConfirmation) {
        currentUser = null;
        return { data: { user, session: null }, error: null };
      }
      currentUser = user;
      return { data: { user, session: { access_token: 'test-session' } }, error: null };
    },
    async signInWithPassword(payload) {
      signinPayload = payload;
      currentUser = { id: 'student-1', email: payload.email, user_metadata: { full_name: 'Aluno Teste' } };
      return { data: { user: currentUser, session: { access_token: 'test-session' } }, error: null };
    },
    async signOut() {
      currentUser = null;
      return { error: null };
    }
  };

  const client = {
    auth,
    from(table) {
      const query = {
        async upsert(rows, options) {
          if (failNextUpsert) {
            failNextUpsert = false;
            return { error: { message: 'temporary network failure' } };
          }
          const list = Array.isArray(rows) ? rows : [rows];
          if (table === 'annan_learning_events') {
            for (const row of list) {
              const index = learningEvents.findIndex(item => item.user_id === row.user_id && item.event_id === row.event_id);
              if (index >= 0) learningEvents[index] = row;
              else learningEvents.push(row);
            }
          } else if (table === 'annan_student_profiles') {
            for (const row of list) profiles.set(row.user_id, row);
          }
          return { data: list, error: null, options };
        },
        select() { return query; },
        eq(column, value) { query.filter = { column, value }; return query; },
        order() { return query; },
        async limit() {
          return { data: learningEvents.filter(row => row.user_id === (query.filter || {}).value), error: null };
        },
        async maybeSingle() {
          return { data: profiles.get((query.filter || {}).value) || null, error: null };
        }
      };
      return query;
    }
  };

  class CustomEvent {
    constructor(type, options) { this.type = type; this.detail = options && options.detail; }
  }
  const window = {
    location: { origin: 'https://placurso.netlify.app', pathname: '/' },
    supabase: { createClient(url, key, options) { assert.match(url, /^https:\/\//); assert.match(key, /^sb_publishable_/); return client; } },
    addEventListener(type, callback) { listeners[type] = callback; },
    dispatchEvent(event) { (listeners['dispatch:' + event.type] || function(){ })(event); return true; }
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    querySelector() { return null; },
    createElement() { return { dataset: {}, addEventListener() {} }; },
    head: { appendChild() {} }
  };
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); }
  };

  const source = fs.readFileSync(require.resolve('./annan_supabase_adapter.js'), 'utf8');
  vm.runInNewContext(source, { window, document, localStorage, CustomEvent, Date, Promise, Number, Array, Object, String, Math, setTimeout, console });
  const api = window.PlacursoAnnanPersistence;
  assert.ok(api, 'adapter is exposed');

  const beforeLogin = await api.getCurrentUser();
  assert.equal(beforeLogin.ok, false);
  assert.equal(beforeLogin.reason, 'unauthenticated');

  const invalid = await api.syncEvent({ id: 'invalid', source: 'unknown', game: 'x', correct: 1, total: 1 });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.reason, 'invalid_event');

  requireEmailConfirmation = true;
  const pending = await api.signUp('Aluno Teste', 'aluno@example.com', 'password-123');
  assert.equal(pending.ok, false);
  assert.equal(pending.reason, 'email_confirmation_required');
  assert.equal(signupPayload.options.data.full_name, 'Aluno Teste');
  assert.equal(signupPayload.options.emailRedirectTo, 'https://placurso.netlify.app/');
  assert.equal(currentUser, null);

  requireEmailConfirmation = false;
  const created = await api.signUp('Aluno Teste', 'aluno@example.com', 'password-123');
  assert.equal(created.ok, true);
  assert.equal(created.user.id, 'student-1');
  assert.equal(await api.getCurrentUser().then(result => result.ok), true);

  const localEvents = [
    { id: 'event-1', source: 'psychotechnical', game: 'psychotechnical', correct: 5, total: 7, score: 71, passed: true, at: '2026-11-01T12:00:00.000Z' },
    { id: 'event-1', source: 'psychotechnical', game: 'psychotechnical', correct: 5, total: 7, score: 71, passed: true, at: '2026-11-01T12:00:00.000Z' },
    { id: 'event-2', source: 'bible', game: 'biblia', level: '1', correct: 3, total: 4, score: 75, passed: true, at: '2026-11-01T13:00:00.000Z' }
  ];
  const synced = await api.syncEvents(localEvents);
  assert.equal(synced.ok, true);
  assert.equal(synced.synced, 2);
  assert.equal(learningEvents.length, 2);
  assert.ok(learningEvents.every(row => row.user_id === 'student-1'));
  assert.ok(learningEvents.some(row => row.event_id === 'event-1' && row.occurred_at === '2026-11-01T12:00:00.000Z'));

  failNextUpsert = true;
  const firstFailure = await api.syncEvent({ id: 'event-3', source: 'crypto', game: 'crypto', correct: 1, total: 2, score: 50, at: '2026-11-01T14:00:00.000Z' });
  assert.equal(firstFailure.ok, false);
  const retry = await api.syncEvent({ id: 'event-4', source: 'phase3a', game: 'memoria', correct: 2, total: 2, score: 100, at: '2026-11-01T15:00:00.000Z' });
  assert.equal(retry.ok, true, 'a failed sync must not poison the event queue');
  assert.ok(learningEvents.some(row => row.event_id === 'event-4'));

  const signedIn = await api.signIn('aluno@example.com', 'password-123');
  assert.equal(signedIn.ok, true);
  assert.equal(signinPayload.email, 'aluno@example.com');

  const signedOut = await api.signOut();
  assert.equal(signedOut.ok, true);
  assert.equal((await api.getCurrentUser()).reason, 'unauthenticated');
  const afterSignOut = await api.syncEvents(localEvents);
  assert.equal(afterSignOut.reason, 'unauthenticated');

  console.log('ANNAN Supabase adapter: auth, confirmation, idempotent sync, and queue recovery PASS');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
