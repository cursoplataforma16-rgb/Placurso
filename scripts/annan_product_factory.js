'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PlacursoAnnanProductFactory = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const PRODUCT_TYPES = new Set(['ebook', 'course', 'calculator', 'tool']);
  const PLAN = [
    'research',
    'outline',
    'draft',
    'quality-review',
    'pricing',
    'publication-readiness'
  ];

  function text(value, max) {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const valueText = String(value).trim();
    return valueText && valueText.length <= max ? valueText : null;
  }

  function normalizeSources(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    const output = [];
    value.forEach(function (item) {
      const source = text(item, 256);
      if (source && !seen.has(source)) {
        seen.add(source);
        output.push(source);
      }
    });
    return output;
  }

  function normalizeOpportunity(input) {
    const errors = [];
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return { valid: false, errors: ['opportunity-required'], brief: null, plan: [] };
    }

    const id = text(input.id, 128);
    const type = text(input.type, 32);
    const title = text(input.title, 200);
    const audience = text(input.audience, 200);
    const problem = text(input.problem, 1000);
    const promise = text(input.promise, 1000);
    const sources = normalizeSources(input.sources);

    if (!id) errors.push('id-required');
    if (!type) errors.push('type-required');
    else if (!PRODUCT_TYPES.has(type)) errors.push('unsupported-type');
    if (!title) errors.push('title-required');
    if (!audience) errors.push('audience-required');
    if (!problem) errors.push('problem-required');
    if (!promise) errors.push('promise-required');
    if (!sources.length) errors.push('sources-required');

    const valid = errors.length === 0;
    const brief = valid ? {
      id,
      type,
      title,
      audience,
      problem,
      promise,
      sources
    } : null;

    return {
      valid,
      errors,
      brief,
      plan: valid ? PLAN.slice() : []
    };
  }

  return {
    PRODUCT_TYPES: Array.from(PRODUCT_TYPES),
    PLAN: PLAN.slice(),
    normalizeOpportunity
  };
});
