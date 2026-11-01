/* Voz do ANNAN: mantém ANNAN como nome próprio na interface e adapta a fala
   à intenção pedagógica. A identidade da voz não muda; variam ritmo e entoação. */
(function (root) {
  'use strict';

  const PROFILES = {
    abertura:   { rate: 0.96, pitch: 1.08 },
    explicacao: { rate: 0.92, pitch: 0.97 },
    exemplo:    { rate: 1.02, pitch: 1.02 },
    pratica:    { rate: 1.00, pitch: 1.12 },
    resumo:     { rate: 0.95, pitch: 1.00 },
    pergunta:   { rate: 0.98, pitch: 1.07 }
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // Só altera o texto enviado ao sintetizador. Legendas e interface continuam ANNAN.
  function toSpeechText(value) {
    return String(value == null ? '' : value).replace(/\bANNAN\b/gi, 'Annan');
  }

  function preferredVoice(voices) {
    const list = Array.isArray(voices) ? voices : [];
    const priority = [/^pt[-_]AO$/i, /^pt[-_]PT$/i, /^pt[-_]BR$/i, /^pt(?:[-_]|$)/i];
    for (const pattern of priority) {
      const match = list.find(v => v && pattern.test(String(v.lang || '')));
      if (match) return match;
    }
    return null;
  }

  function resolveIntent(text, sceneType) {
    const declared = String(sceneType || '').toLowerCase();
    if (PROFILES[declared]) return declared;
    const value = String(text || '');
    if (/[?？]\s*$/.test(value)) return 'pergunta';
    if (/\b(bem-vindo|bem-vinda|olá|vamos começar|que bom ter)\b/i.test(value)) return 'abertura';
    if (/\b(por exemplo|imagine|exemplo)\b/i.test(value)) return 'exemplo';
    if (/\b(agora|experimente|responda|escolha|pratique|faça)\b/i.test(value)) return 'pratica';
    if (/\b(resumo|em síntese|lembre-se|a ideia principal)\b/i.test(value)) return 'resumo';
    return 'explicacao';
  }

  function profileFor(text, options) {
    const opts = options || {};
    const intent = resolveIntent(text, opts.sceneType);
    const base = PROFILES[intent] || PROFILES.explicacao;
    const index = Math.abs(Number(opts.index) || 0);
    const drift = [-0.012, 0, 0.014][index % 3];
    const value = String(text || '').trim();
    const words = value ? value.split(/\s+/).length : 0;
    const sentenceRate = words > 18 ? -0.035 : words < 6 ? 0.012 : 0;
    const questionPitch = /[?？]\s*$/.test(value) ? 0.035 : 0;
    const exclamationPitch = /[!！]\s*$/.test(value) ? 0.025 : 0;
    const baseRate = Number.isFinite(Number(opts.baseRate)) && Number(opts.baseRate) > 0 ? Number(opts.baseRate) : 1;

    return {
      intent,
      rate: clamp(baseRate * base.rate + drift + sentenceRate, 0.75, 1.7),
      pitch: clamp(base.pitch + drift * 1.4 + questionPitch + exclamationPitch, 0.85, 1.25),
      volume: 1
    };
  }

  function createUtterance(text, options) {
    const Utterance = root.SpeechSynthesisUtterance;
    if (typeof Utterance !== 'function') return null;
    const opts = options || {};
    const utterance = new Utterance(toSpeechText(text));
    const voices = root.speechSynthesis && typeof root.speechSynthesis.getVoices === 'function'
      ? root.speechSynthesis.getVoices() : [];
    const voice = preferredVoice(voices);
    if (voice) utterance.voice = voice;
    utterance.lang = voice && voice.lang ? voice.lang : 'pt-PT';
    const profile = profileFor(text, opts);
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;
    return utterance;
  }

  root.ANNANVoice = Object.freeze({ toSpeechText, preferredVoice, profileFor, createUtterance });
})(typeof window !== 'undefined' ? window : globalThis);
