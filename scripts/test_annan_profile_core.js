'use strict';
const assert = require('node:assert/strict');
const {
  deriveAnnanProfile,
  analyseAnnanProfile,
  addProfileSnapshot,
  getSkillTrend
} = require('./annan_profile_core.js');

function run(name, fn) {
  fn();
  process.stdout.write('PASS ' + name + '\n');
}

const empty = { by: {} };
const emptyCrypto = {
  version: 2,
  levels: {
    basic: { answered: 0, correct: 0 },
    intermediate: { answered: 0, correct: 0 },
    advanced: { answered: 0, correct: 0 }
  }
};

run('empty profile shows missing data, not fabricated zero scores', () => {
  const profile = deriveAnnanProfile(empty, emptyCrypto);
  for (const id of ['memory', 'focus', 'decision', 'strategy', 'finance', 'business', 'ai']) {
    assert.equal(profile.skills[id].score, null);
  }
  assert.equal(profile.skills.ai.status, 'unavailable');
  assert.equal(analyseAnnanProfile(profile).strongest, null);
});

run('game percentages use recorded correct rounds and sample count', () => {
  const profile = deriveAnnanProfile({
    by: {
      memoria: { plays: 3, correct: 2 },
      reflexo: { plays: 2, correct: 1 },
      dinheiro: { plays: 4, correct: 3 },
      negocio: { plays: 2, correct: 1 }
    }
  }, emptyCrypto);
  assert.equal(profile.skills.memory.score, 67);
  assert.equal(profile.skills.memory.samples, 3);
  assert.equal(profile.skills.memory.status, 'measured');
  assert.equal(profile.skills.focus.score, 50);
  assert.equal(profile.skills.business.score, 50);
});

run('finance and strategy combine independent evidence using weighted totals', () => {
  const profile = deriveAnnanProfile({
    by: {
      dinheiro: { plays: 4, correct: 3 },
      negocio: { plays: 2, correct: 1 }
    }
  }, {
    version: 2,
    levels: {
      basic: { answered: 3, correct: 2 },
      intermediate: { answered: 2, correct: 1 },
      advanced: { answered: 3, correct: 2 }
    }
  });
  assert.equal(profile.skills.finance.samples, 12);
  assert.equal(profile.skills.finance.score, 67);
  assert.equal(profile.skills.strategy.samples, 5);
  assert.equal(profile.skills.strategy.score, 60);
  assert.equal(profile.skills.decision.score, 75);
});

run('ANNAN does not name a strongest area before three observations', () => {
  const profile = deriveAnnanProfile({
    by: { memoria: { plays: 1, correct: 1 }, reflexo: { plays: 2, correct: 2 } }
  }, emptyCrypto);
  assert.equal(analyseAnnanProfile(profile).strongest, null);
});

run('ANNAN names the strongest measured area only with sufficient evidence', () => {
  const profile = deriveAnnanProfile({
    by: {
      memoria: { plays: 4, correct: 3 },
      reflexo: { plays: 3, correct: 3 },
      dinheiro: { plays: 3, correct: 1 }
    }
  }, emptyCrypto);
  assert.equal(analyseAnnanProfile(profile).strongest.id, 'focus');
});

run('ANNAN recommends an unpractised activity before repeating a measured one', () => {
  const profile = deriveAnnanProfile({
    by: { memoria: { plays: 3, correct: 2 } }
  }, emptyCrypto);
  assert.equal(analyseAnnanProfile(profile).next.id, 'focus');
});

run('ANNAN recommends the lowest measured area once available activities have enough evidence', () => {
  const profile = deriveAnnanProfile({
    by: {
      memoria: { plays: 3, correct: 3 },
      reflexo: { plays: 3, correct: 1 },
      dinheiro: { plays: 3, correct: 2 },
      negocio: { plays: 3, correct: 3 }
    }
  }, {
    version: 2,
    levels: {
      basic: { answered: 3, correct: 3 },
      intermediate: { answered: 3, correct: 3 },
      advanced: { answered: 3, correct: 3 }
    }
  });
  assert.equal(analyseAnnanProfile(profile).next.id, 'focus');
});

run('trend requires two comparable scores and reports percentage-point change', () => {
  assert.equal(getSkillTrend([{ scores: { memory: 40 } }], 'memory'), null);
  const trend = getSkillTrend([
    { scores: { memory: 40 } },
    { scores: { memory: 55 } }
  ], 'memory');
  assert.equal(trend.change, 15);
});

run('snapshots are deduplicated by event ID and bounded to the latest thirty', () => {
  const profile = deriveAnnanProfile({ by: { memoria: { plays: 1, correct: 1 } } }, emptyCrypto);
  const first = addProfileSnapshot([], profile, '2026-10-31T10:00:00.000Z', 'event-1');
  const duplicate = addProfileSnapshot(first, profile, '2026-10-31T10:00:00.000Z', 'event-1');
  assert.equal(duplicate.length, 1);
  let history = duplicate;
  for (let i = 2; i <= 35; i++) {
    history = addProfileSnapshot(history, profile, '2026-10-31T10:00:00.000Z', 'event-' + i);
  }
  assert.equal(history.length, 30);
  assert.equal(history[0].eventId, 'event-6');
});

run('malformed source values are safely bounded', () => {
  const profile = deriveAnnanProfile({
    by: { memoria: { plays: 2, correct: 99 }, reflexo: { plays: -4, correct: -3 } }
  }, emptyCrypto);
  assert.equal(profile.skills.memory.score, 100);
  assert.equal(profile.skills.memory.samples, 2);
  assert.equal(profile.skills.focus.score, null);
});

process.stdout.write('All ANNAN profile core tests passed.\n');
