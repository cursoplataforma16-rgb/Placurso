'use strict';
const assert = require('node:assert/strict');
let core;
try {
  core = require('./annan_learning_core.js');
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  core = {};
}

function run(name, fn) {
  fn();
  process.stdout.write('PASS ' + name + '\n');
}

function requireApi(name) {
  assert.equal(typeof core[name], 'function', 'missing ANNAN learning API: ' + name);
}

run('exports the learning memory contract', () => {
  for (const name of ['createLearningState', 'sanitizeLearningState', 'normalizeLearningEvent', 'recordLearningEvent', 'summarizeLearning', 'recommendNextAction']) requireApi(name);
});

run('creates a clean versioned learning state', () => {
  const state = core.createLearningState();
  assert.deepEqual(state, { version: 1, events: [], processedIds: [], updatedAt: null });
});

run('rejects events without a stable ID, supported source or positive total', () => {
  const state = core.createLearningState();
  assert.equal(core.recordLearningEvent(state, { source: 'phase3a', game: 'memoria', correct: 1, total: 2 }).added, false);
  assert.equal(core.recordLearningEvent(state, { id: 'x', source: 'unknown', game: 'memoria', correct: 1, total: 2 }).added, false);
  assert.equal(core.recordLearningEvent(state, { id: 'y', source: 'phase3a', game: 'memoria', correct: 1, total: 0 }).added, false);
  assert.equal(state.events.length, 0);
});

run('normalizes event scores and stores outcomes without raw answers', () => {
  const event = core.normalizeLearningEvent({
    id: 'result-1', source: 'phase3a', game: 'memoria', level: 2,
    correct: 99, total: 3, elapsed: 5,
    answers: { q1: 'private-choice' }
  }, '2026-10-31T10:00:00.000Z');
  assert.equal(event.score, 100);
  assert.equal(event.correct, 3);
  assert.equal(event.passed, true);
  assert.equal(event.at, '2026-10-31T10:00:00.000Z');
  assert.equal(Object.hasOwn(event, 'answers'), false);
});

run('deduplicates repeated event IDs', () => {
  const first = core.recordLearningEvent(core.createLearningState(), {
    id: 'same-event', source: 'phase3a', game: 'reflexo', correct: 1, total: 1
  }, '2026-10-31T10:00:00.000Z');
  const duplicate = core.recordLearningEvent(first.state, {
    id: 'same-event', source: 'phase3a', game: 'reflexo', correct: 0, total: 1
  }, '2026-10-31T10:01:00.000Z');
  assert.equal(first.added, true);
  assert.equal(duplicate.added, false);
  assert.equal(duplicate.state.events.length, 1);
  assert.equal(duplicate.state.events[0].score, 100);
});

run('keeps only the latest 120 learning events', () => {
  let state = core.createLearningState();
  for (let i = 1; i <= 130; i++) {
    state = core.recordLearningEvent(state, {
      id: 'event-' + i, source: 'phase3a', game: 'memoria', correct: i % 2, total: 1
    }, '2026-10-31T10:00:00.000Z').state;
  }
  assert.equal(state.events.length, 120);
  assert.equal(state.events[0].id, 'event-11');
  assert.equal(state.processedIds.length, 130);
});

run('recovers malformed persisted state safely', () => {
  const state = core.sanitizeLearningState({
    version: 1,
    events: [null, { id: 'good', source: 'crypto', game: 'crypto', correct: 4, total: 2 }],
    processedIds: ['old', '', 'old'],
    unknown: 'discard'
  });
  assert.equal(state.events.length, 1);
  assert.equal(state.events[0].correct, 2);
  assert.deepEqual(state.processedIds, ['old', 'good']);
  assert.equal(Object.hasOwn(state, 'unknown'), false);
});

run('summarizes source, game and recent result counts accurately', () => {
  let state = core.createLearningState();
  state = core.recordLearningEvent(state, { id: 'one', source: 'phase3a', game: 'memoria', correct: 2, total: 3 }, '2026-10-31T10:00:00.000Z').state;
  state = core.recordLearningEvent(state, { id: 'two', source: 'crypto', game: 'crypto', level: 'basic', correct: 3, total: 3 }, '2026-10-31T10:01:00.000Z').state;
  const summary = core.summarizeLearning(state);
  assert.equal(summary.totalEvents, 2);
  assert.equal(summary.averageScore, 83);
  assert.equal(summary.bySource.phase3a, 1);
  assert.equal(summary.bySource.crypto, 1);
  assert.equal(summary.byGame.memoria.count, 1);
  assert.equal(summary.byGame.crypto.averageScore, 100);
  assert.equal(summary.lastEvent.id, 'two');
});

run('recommends reinforcement after a weak recorded game result', () => {
  const event = { id: 'weak-1', source: 'phase3a', game: 'reflexo', correct: 1, total: 3 };
  const state = core.recordLearningEvent(core.createLearningState(), event, '2026-10-31T10:00:00.000Z').state;
  const recommendation = core.recommendNextAction({}, state, { next: { id: 'memory', label: 'Memória', action: 'memoria' } });
  assert.equal(recommendation.action, 'reflexo');
  assert.equal(recommendation.type, 'reinforce');
  assert.match(recommendation.reason, /33%/);
  assert.equal(recommendation.supportEventId, 'weak-1');
});

run('continues Bible learning after a passed mission', () => {
  const state = core.recordLearningEvent(core.createLearningState(), {
    id: 'bible-1', source: 'bible', game: 'biblia', level: 1, correct: 3, total: 3, passed: true
  }, '2026-10-31T10:00:00.000Z').state;
  const recommendation = core.recommendNextAction({}, state, null);
  assert.equal(recommendation.action, 'biblia');
  assert.equal(recommendation.type, 'continue');
  assert.match(recommendation.reason, /nível 2/i);
});

run('falls back to the existing profile recommendation when no reinforcement is needed', () => {
  const state = core.recordLearningEvent(core.createLearningState(), {
    id: 'good-1', source: 'phase3a', game: 'memoria', correct: 3, total: 3
  }, '2026-10-31T10:00:00.000Z').state;
  const recommendation = core.recommendNextAction({}, state, { next: { id: 'focus', label: 'Foco', action: 'reflexo' } });
  assert.equal(recommendation.action, 'reflexo');
  assert.equal(recommendation.type, 'develop');
});

run('reports exploration without inventing a measured weakness when evidence is absent', () => {
  const recommendation = core.recommendNextAction({}, core.createLearningState(), null);
  assert.equal(recommendation.type, 'explore');
  assert.equal(recommendation.action, null);
  assert.match(recommendation.reason, /dados|resultados/i);
});

process.stdout.write('All ANNAN learning core tests passed.\n');