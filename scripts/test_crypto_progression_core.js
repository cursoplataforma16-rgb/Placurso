'use strict';
const assert = require('node:assert/strict');
const {
  createCryptoState,
  canStartCryptoLevel,
  recordCryptoMission,
  migrateCryptoState
} = require('./crypto_progression_core.js');

function run(name, fn) {
  fn();
  process.stdout.write('PASS ' + name + '\n');
}

run('fresh state starts with zero progress and only basic open', () => {
  const state = createCryptoState();
  assert.equal(state.version, 2);
  assert.equal(state.levels.basic.attempts, 0);
  assert.equal(canStartCryptoLevel(state, 'basic'), true);
  assert.equal(canStartCryptoLevel(state, 'intermediate'), false);
  assert.equal(canStartCryptoLevel(state, 'advanced'), false);
});

run('failed mission records practice but does not count as passed', () => {
  const result = recordCryptoMission(createCryptoState(), 'basic', 1, 3);
  assert.equal(result.passed, false);
  assert.equal(result.state.levels.basic.attempts, 1);
  assert.equal(result.state.levels.basic.passed, 0);
  assert.equal(result.state.completed, 1);
  assert.equal(canStartCryptoLevel(result.state, 'intermediate'), false);
});

run('one passed mission is insufficient; two passed missions unlock next level', () => {
  let state = createCryptoState();
  state = recordCryptoMission(state, 'basic', 2, 3).state;
  assert.equal(state.levels.basic.passed, 1);
  assert.equal(canStartCryptoLevel(state, 'intermediate'), false);
  state = recordCryptoMission(state, 'basic', 3, 3).state;
  assert.equal(state.levels.basic.passed, 2);
  assert.equal(canStartCryptoLevel(state, 'intermediate'), true);
  assert.equal(canStartCryptoLevel(state, 'advanced'), false);
});

run('scores and totals are safely clamped', () => {
  const result = recordCryptoMission(createCryptoState(), 'basic', 99, 3);
  assert.equal(result.state.levels.basic.correct, 3);
  assert.equal(result.state.levels.basic.answered, 3);
  assert.equal(result.passed, true);
});

run('legacy v1 migration retains XP and completions but discards unreliable unlock counters', () => {
  const migrated = migrateCryptoState({
    basic: 20, intermediate: 9, advanced: 4, xp: 37, completed: 11
  });
  assert.equal(migrated.version, 2);
  assert.equal(migrated.xp, 37);
  assert.equal(migrated.completed, 11);
  assert.equal(migrated.levels.basic.passed, 0);
  assert.equal(migrated.levels.intermediate.passed, 0);
  assert.equal(canStartCryptoLevel(migrated, 'intermediate'), false);
});

run('malformed persisted values are recovered without negative counters', () => {
  const migrated = migrateCryptoState(null, {
    version: 2,
    xp: -8,
    completed: 'bad',
    levels: { basic: { attempts: -4, passed: 99, answered: 2, correct: 99 } }
  });
  assert.equal(migrated.xp, 0);
  assert.equal(migrated.completed, 0);
  assert.equal(migrated.levels.basic.attempts, 0);
  assert.equal(migrated.levels.basic.passed, 0);
  assert.equal(migrated.levels.basic.correct, 2);
});

process.stdout.write('All crypto progression tests passed.\n');
