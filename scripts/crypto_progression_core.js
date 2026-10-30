'use strict';
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PlacursoCryptoProgression = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const LEVELS = ['basic', 'intermediate', 'advanced'];

  function integer(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
  }

  function createCryptoState() {
    const levels = {};
    LEVELS.forEach((key) => {
      levels[key] = { attempts: 0, passed: 0, answered: 0, correct: 0 };
    });
    return { version: 2, levels, xp: 0, completed: 0 };
  }

  function sanitizeCryptoState(input) {
    const output = createCryptoState();
    if (!input || typeof input !== 'object') return output;
    output.xp = integer(input.xp);
    output.completed = integer(input.completed);
    LEVELS.forEach((key) => {
      const source = input.levels && input.levels[key];
      if (!source || typeof source !== 'object') return;
      const attempts = integer(source.attempts);
      const answered = integer(source.answered);
      output.levels[key] = {
        attempts,
        passed: Math.min(attempts, integer(source.passed)),
        answered,
        correct: Math.min(answered, integer(source.correct))
      };
    });
    return output;
  }

  function migrateCryptoState(legacyState, version2State) {
    if (version2State && Number(version2State.version) === 2) {
      return sanitizeCryptoState(version2State);
    }
    const migrated = createCryptoState();
    if (legacyState && typeof legacyState === 'object') {
      migrated.xp = integer(legacyState.xp);
      migrated.completed = integer(legacyState.completed);
    }
    return migrated;
  }

  function canStartCryptoLevel(state, level) {
    if (!LEVELS.includes(level)) return false;
    const safe = sanitizeCryptoState(state);
    if (level === 'basic') return true;
    if (level === 'intermediate') return safe.levels.basic.passed >= 2;
    return safe.levels.intermediate.passed >= 2;
  }

  function recordCryptoMission(state, level, score, total) {
    if (!LEVELS.includes(level)) throw new RangeError('Unknown crypto level: ' + level);
    const safe = sanitizeCryptoState(state);
    const totalCount = integer(total);
    if (totalCount < 1) throw new RangeError('Mission must contain at least one question.');
    const scoreCount = Math.min(totalCount, integer(score));
    const missionPassed = scoreCount >= Math.ceil((totalCount * 2) / 3);
    const stats = safe.levels[level];
    stats.attempts += 1;
    stats.answered += totalCount;
    stats.correct += scoreCount;
    if (missionPassed) stats.passed += 1;
    safe.completed += 1;
    safe.xp += missionPassed ? scoreCount + 5 : Math.max(1, Math.floor(scoreCount / 2) + 1);
    return { state: safe, passed: missionPassed };
  }

  return {
    LEVELS,
    createCryptoState,
    sanitizeCryptoState,
    migrateCryptoState,
    canStartCryptoLevel,
    recordCryptoMission
  };
});
