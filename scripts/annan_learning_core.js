'use strict';
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PlacursoAnnanLearningCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const MAX_EVENTS = 120;
  const MAX_PROCESSED_IDS = 240;
  const SOURCES = new Set(['phase3a', 'crypto', 'psychotechnical', 'bible']);
  const GAMES_BY_SOURCE = {
    phase3a: new Set(['memoria', 'reflexo', 'dinheiro', 'negocio']),
    crypto: new Set(['crypto']),
    psychotechnical: new Set(['psychotechnical']),
    bible: new Set(['biblia'])
  };
  const GAME_ACTIONS = {
    memoria: { action: 'memoria', label: 'Memória em cadeia' },
    reflexo: { action: 'reflexo', label: 'Reflexo e foco' },
    dinheiro: { action: 'dinheiro', label: 'Decisão financeira' },
    negocio: { action: 'negocio', label: 'Mini negócio' },
    crypto: { action: 'crypto', label: 'Finanças e cripto' },
    biblia: { action: 'biblia', label: 'Conhecer Deus' }
  };

  function safeInteger(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.floor(number) : fallback;
  }

  function safeText(value, maxLength) {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const text = String(value).trim();
    return text && text.length <= maxLength ? text : null;
  }

  function safeTimestamp(value, fallback) {
    const candidate = typeof value === 'string' ? value : fallback;
    if (typeof candidate === 'string' && Number.isFinite(Date.parse(candidate))) {
      return new Date(candidate).toISOString();
    }
    return new Date().toISOString();
  }

  function createLearningState() {
    return { version: 1, events: [], processedIds: [], updatedAt: null };
  }

  function normalizeLearningEvent(input, timestamp) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
    const id = safeText(input.id, 128);
    const source = safeText(input.source, 32);
    if (!id || !source || !SOURCES.has(source)) return null;

    const defaultGame = source === 'crypto' ? 'crypto'
      : source === 'psychotechnical' ? 'psychotechnical'
        : source === 'bible' ? 'biblia' : null;
    const game = safeText(input.game || defaultGame, 32);
    if (!game || !GAMES_BY_SOURCE[source].has(game)) return null;

    const totalRaw = safeInteger(input.total, 0);
    if (totalRaw < 1 || totalRaw > 10000) return null;
    const correct = Math.max(0, Math.min(totalRaw, safeInteger(input.correct, 0)));
    const score = Math.round((correct / totalRaw) * 100);
    const passed = typeof input.passed === 'boolean' ? input.passed : score >= 67;
    const level = safeText(input.level, 32);
    const elapsedRaw = safeInteger(input.elapsed, -1);
    const elapsed = elapsedRaw >= 0 && elapsedRaw <= 86400 ? elapsedRaw : null;

    return {
      id,
      source,
      game,
      level,
      correct,
      total: totalRaw,
      score,
      passed,
      elapsed,
      at: safeTimestamp(input.at, timestamp)
    };
  }

  function sanitizeLearningState(input) {
    const output = createLearningState();
    if (!input || typeof input !== 'object' || Array.isArray(input) || Number(input.version) !== 1) return output;

    const processedIds = new Set();
    const processed = [];
    const rawProcessed = Array.isArray(input.processedIds) ? input.processedIds : [];
    rawProcessed.forEach(function (value) {
      const id = safeText(value, 128);
      if (id && !processedIds.has(id)) {
        processedIds.add(id);
        processed.push(id);
      }
    });

    const eventIds = new Set();
    const rawEvents = Array.isArray(input.events) ? input.events : [];
    rawEvents.forEach(function (value) {
      const event = normalizeLearningEvent(value, value && value.at);
      if (!event || eventIds.has(event.id)) return;
      eventIds.add(event.id);
      output.events.push(event);
      if (!processedIds.has(event.id)) {
        processedIds.add(event.id);
        processed.push(event.id);
      }
    });

    output.events = output.events.slice(-MAX_EVENTS);
    output.processedIds = processed.slice(-MAX_PROCESSED_IDS);
    output.updatedAt = typeof input.updatedAt === 'string' && Number.isFinite(Date.parse(input.updatedAt))
      ? new Date(input.updatedAt).toISOString() : null;
    return output;
  }

  function recordLearningEvent(state, input, timestamp) {
    const output = sanitizeLearningState(state);
    const event = normalizeLearningEvent(input, timestamp);
    if (!event) return { state: output, added: false, reason: 'invalid-event', event: null };
    if (output.processedIds.includes(event.id)) {
      return { state: output, added: false, reason: 'duplicate-event', event: null };
    }

    output.events.push(event);
    output.events = output.events.slice(-MAX_EVENTS);
    output.processedIds = output.processedIds.concat(event.id).slice(-MAX_PROCESSED_IDS);
    output.updatedAt = event.at;
    return { state: output, added: true, reason: null, event };
  }

  function summarizeLearning(state) {
    const safe = sanitizeLearningState(state);
    const bySource = {};
    const byGame = {};
    let totalCorrect = 0;
    let totalQuestions = 0;
    safe.events.forEach(function (event) {
      bySource[event.source] = (bySource[event.source] || 0) + 1;
      if (!byGame[event.game]) byGame[event.game] = { count: 0, correct: 0, questions: 0, averageScore: null };
      byGame[event.game].count += 1;
      byGame[event.game].correct += event.correct;
      byGame[event.game].questions += event.total;
      totalCorrect += event.correct;
      totalQuestions += event.total;
    });
    Object.keys(byGame).forEach(function (game) {
      const item = byGame[game];
      item.averageScore = item.questions > 0 ? Math.round((item.correct / item.questions) * 100) : null;
    });
    const recent = safe.events.slice(-10);
    const recentTotals = recent.reduce(function (sum, event) {
      sum.correct += event.correct;
      sum.questions += event.total;
      return sum;
    }, { correct: 0, questions: 0 });
    return {
      totalEvents: safe.events.length,
      averageScore: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null,
      recentAverageScore: recentTotals.questions > 0 ? Math.round((recentTotals.correct / recentTotals.questions) * 100) : null,
      bySource,
      byGame,
      lastEvent: safe.events.length ? safe.events[safe.events.length - 1] : null
    };
  }

  function recommendation(action, label, type, reason, event) {
    return {
      action: action || null,
      label,
      type,
      reason,
      score: event ? event.score : null,
      supportEventId: event ? event.id : null
    };
  }

  function recommendNextAction(profile, state, profileAnalysis) {
    const safe = sanitizeLearningState(state);
    const last = safe.events.length ? safe.events[safe.events.length - 1] : null;

    if (last && last.source === 'bible') {
      const bible = GAME_ACTIONS.biblia;
      const level = Math.max(1, safeInteger(last.level, 1));
      if (!last.passed || last.score < 67) {
        return recommendation(bible.action, 'Reforçar ' + bible.label,
          'reinforce', 'Na última missão de aprendizagem bíblica, o resultado foi ' + last.score + '%. Vamos rever os princípios e tentar novamente.', last);
      }
      if (level < 3) {
        return recommendation(bible.action, 'Continuar ' + bible.label + ' · nível ' + (level + 1),
          'continue', 'Concluíste o nível ' + level + ' com ' + last.score + '%. O próximo passo é aprofundar a aprendizagem no nível ' + (level + 1) + '.', last);
      }
    }

    if (last && last.score < 60 && GAME_ACTIONS[last.game] && last.game !== 'biblia') {
      const target = GAME_ACTIONS[last.game];
      return recommendation(target.action, 'Reforçar ' + target.label,
        'reinforce', 'Na última tentativa de ' + target.label + ', registaste ' + last.score + '%. Vamos praticar esta área mais uma vez.', last);
    }

    const next = profileAnalysis && profileAnalysis.next;
    if (next && next.action) {
      const label = last ? 'Desenvolver ' + next.label : 'Experimentar ' + next.label;
      const reason = last
        ? 'O último resultado foi registado. O próximo passo é ampliar a prática em ' + next.label + ', seguindo o perfil actual do ANNAN.'
        : 'Ainda não há histórico de aprendizagem suficiente. Começa por experimentar ' + next.label + ' para construir uma base real.';
      return recommendation(next.action, label, last ? 'develop' : 'explore', reason, last);
    }

    return recommendation(null, 'Explorar um desafio', 'explore',
      'Ainda não há resultados suficientes para recomendar uma área medida. Faz um desafio para começar a construir o teu histórico.', last);
  }

  return {
    MAX_EVENTS,
    MAX_PROCESSED_IDS,
    createLearningState,
    sanitizeLearningState,
    normalizeLearningEvent,
    recordLearningEvent,
    summarizeLearning,
    recommendNextAction
  };
});