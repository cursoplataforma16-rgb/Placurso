'use strict';
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PlacursoAnnanProfileCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const AVAILABLE = ['memory', 'focus', 'decision', 'finance', 'business', 'strategy'];
  const META = {
    memory: { label: 'Memória', icon: '🧠', action: 'memoria', source: 'Memória em cadeia' },
    focus: { label: 'Foco', icon: '🎯', action: 'reflexo', source: 'Reflexo rápido' },
    decision: { label: 'Decisão', icon: '⚡', action: 'dinheiro', source: 'Decisão financeira' },
    finance: { label: 'Finanças', icon: '💰', action: 'crypto', source: 'Simulações de finanças e cripto' },
    business: { label: 'Negócio', icon: '💼', action: 'negocio', source: 'Mini negócio' },
    strategy: { label: 'Estratégia', icon: '♟', action: 'negocio', source: 'Mini negócio e cenários avançados' },
    ai: { label: 'IA', icon: '🤖', action: null, source: 'Experiência de IA ainda não publicada' }
  };

  function count(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }

  function readGame(state, key) {
    const game = state && state.by && state.by[key] && typeof state.by[key] === 'object'
      ? state.by[key] : {};
    const total = count(game.plays);
    return { total, correct: Math.min(total, count(game.correct)) };
  }

  function readCrypto(state, requestedLevels) {
    const levels = state && state.levels && typeof state.levels === 'object' ? state.levels : {};
    const names = requestedLevels || ['basic', 'intermediate', 'advanced'];
    return names.reduce((sum, key) => {
      const level = levels[key] && typeof levels[key] === 'object' ? levels[key] : {};
      const answered = count(level.answered);
      return {
        total: sum.total + answered,
        correct: sum.correct + Math.min(answered, count(level.correct))
      };
    }, { total: 0, correct: 0 });
  }

  function combine(parts) {
    const totals = parts.reduce((sum, item) => ({
      total: sum.total + item.total,
      correct: sum.correct + item.correct
    }), { total: 0, correct: 0 });
    return {
      score: totals.total > 0 ? Math.max(0, Math.min(100, Math.round((totals.correct / totals.total) * 100))) : null,
      samples: totals.total,
      correct: totals.correct,
      total: totals.total
    };
  }

  function makeSkill(id, metrics) {
    const meta = META[id];
    const samples = metrics.samples || 0;
    return {
      id,
      label: meta.label,
      icon: meta.icon,
      score: metrics.score,
      samples,
      correct: metrics.correct || 0,
      total: metrics.total || 0,
      status: id === 'ai' ? 'unavailable' : samples === 0 ? 'missing' : samples < 3 ? 'initial' : 'measured',
      action: meta.action,
      source: meta.source
    };
  }

  function deriveAnnanProfile(phase3aState, cryptoState) {
    const memory = readGame(phase3aState, 'memoria');
    const focus = readGame(phase3aState, 'reflexo');
    const decisions = readGame(phase3aState, 'dinheiro');
    const business = readGame(phase3aState, 'negocio');
    const cryptoAll = readCrypto(cryptoState);
    const cryptoAdvanced = readCrypto(cryptoState, ['advanced']);
    const skills = {
      memory: makeSkill('memory', combine([memory])),
      focus: makeSkill('focus', combine([focus])),
      decision: makeSkill('decision', combine([decisions])),
      finance: makeSkill('finance', combine([decisions, cryptoAll])),
      business: makeSkill('business', combine([business])),
      strategy: makeSkill('strategy', combine([business, cryptoAdvanced])),
      ai: makeSkill('ai', { score: null, samples: 0, correct: 0, total: 0 })
    };
    return {
      skills,
      totalObservations: Object.keys(skills).reduce((sum, key) => sum + skills[key].samples, 0),
      generatedAt: null
    };
  }

  function analyseAnnanProfile(profile) {
    const skills = profile && profile.skills ? profile.skills : {};
    const available = AVAILABLE.map((id) => skills[id]).filter((skill) => skill && skill.action && skill.score !== null);
    const strongestPool = available.filter((skill) => skill.samples >= 3);
    strongestPool.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
    const strongest = strongestPool[0] || null;

    let next = null;
    const unpractised = AVAILABLE.map((id) => skills[id]).filter((skill) => skill && skill.action && skill.samples === 0);
    if (unpractised.length) {
      next = unpractised[0];
    } else {
      const lowSample = available.filter((skill) => skill.samples < 3).sort((a, b) => a.samples - b.samples || a.score - b.score);
      if (lowSample.length) next = lowSample[0];
      else next = available.slice().sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))[0] || null;
    }

    const observations = AVAILABLE.reduce((sum, id) => sum + (skills[id] ? skills[id].samples : 0), 0);
    let message;
    if (observations === 0) {
      message = 'Ainda não há resultados suficientes para identificar padrões. Faz um desafio curto e começo a acompanhar a tua evolução.';
    } else if (strongest) {
      message = 'O sinal mais consistente está em ' + strongest.label + ' (' + strongest.score + '%), com ' + strongest.samples + ' observações. O próximo passo é praticar ' + (next ? next.label : 'uma nova experiência') + '.';
    } else {
      message = 'Já existem primeiras respostas registadas. Ainda são poucas para apontar uma área mais forte; vamos ampliar a amostra com ' + (next ? next.label : 'mais desafios') + '.';
    }
    return { strongest, next, message, observations };
  }

  function addProfileSnapshot(history, profile, timestamp, eventId) {
    const previous = Array.isArray(history) ? history.slice() : [];
    const id = eventId === undefined || eventId === null ? '' : String(eventId);
    if (id && previous.some((item) => item && item.eventId === id)) return previous.slice(-30);
    const scores = {};
    Object.keys(profile && profile.skills ? profile.skills : {}).forEach((key) => {
      const value = profile.skills[key] && profile.skills[key].score;
      scores[key] = Number.isFinite(value) ? value : null;
    });
    previous.push({ at: String(timestamp || new Date().toISOString()), eventId: id, scores });
    return previous.slice(-30);
  }

  function getSkillTrend(history, skillId) {
    if (!Array.isArray(history)) return null;
    const comparable = history.filter((item) => item && item.scores && Number.isFinite(item.scores[skillId]));
    if (comparable.length < 2) return null;
    const previous = comparable[comparable.length - 2].scores[skillId];
    const current = comparable[comparable.length - 1].scores[skillId];
    return { previous, current, change: current - previous };
  }

  return { deriveAnnanProfile, analyseAnnanProfile, addProfileSnapshot, getSkillTrend };
});
