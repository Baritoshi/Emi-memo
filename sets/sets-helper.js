// sets-helper.js — read-only library of sets shared by all games.
// Source of truth: window.PRELOADED_PAIR_SETS from sets/preloaded-sets.js.
(function () {
  const CUR_KEY = 'pairsets_v1:current'; // { name, ts }

  const safeParse = (json, fallback) => {
    try { return JSON.parse(json); } catch { return fallback; }
  };
  const nowTs = () => Date.now();

  function normalizeText(text) {
    return String(text || '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function normalizePair(item) {
    if (Array.isArray(item)) {
      const term = normalizeText(item[0]);
      const meaning = normalizeText(item.slice(1).join(';'));
      return term && meaning ? { term, meaning } : null;
    }

    if (item && typeof item === 'object') {
      const term = normalizeText(item.term);
      const meaning = normalizeText(item.meaning);
      return term && meaning ? { term, meaning } : null;
    }

    return null;
  }

  function loadPreloadedSets() {
    const source = window.PRELOADED_PAIR_SETS || {};
    const out = {};

    Object.entries(source).forEach(([name, pairs]) => {
      const cleanName = normalizeText(name);
      if (!cleanName || !Array.isArray(pairs)) return;

      const cleanPairs = pairs
        .map(normalizePair)
        .filter(Boolean);

      if (cleanPairs.length) out[cleanName] = cleanPairs;
    });

    return out;
  }

  const allSets = loadPreloadedSets();

  function listSets() {
    return Object.keys(allSets)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
  }

  function getSet(name) {
    const pairs = allSets[name];
    return Array.isArray(pairs) ? pairs.map(p => ({ ...p })) : [];
  }

  function hasSet(name) {
    return !!name && Array.isArray(allSets[name]);
  }

  function firstSetName() {
    return listSets()[0] || null;
  }

  function setCurrent(name) {
    const cleanName = normalizeText(name);
    if (!hasSet(cleanName)) return false;

    localStorage.setItem(CUR_KEY, JSON.stringify({ name: cleanName, ts: nowTs() }));
    window.dispatchEvent(new Event('pairsets:current'));
    return true;
  }

  function getCurrent() {
    const cur = safeParse(localStorage.getItem(CUR_KEY), null);
    if (cur && typeof cur.name === 'string' && hasSet(cur.name)) return cur.name;
    return firstSetName();
  }

  window.addEventListener('storage', (e) => {
    if (e.key === CUR_KEY) window.dispatchEvent(new Event('pairsets:current'));
  });

  function pairsToTextarea(pairs) {
    return (pairs || []).map(p => `${p.term}; ${p.meaning}`).join('\n');
  }

  function textareaToPairs(text) {
    const out = [];
    (text || '').split(/\r?\n/).forEach(line => {
      const t = line.trim();
      if (!t) return;

      const parts = t.split(';');
      if (parts.length < 2) return;

      const term = normalizeText(parts[0]);
      const meaning = normalizeText(parts.slice(1).join(';'));
      if (term && meaning) out.push({ term, meaning });
    });
    return out;
  }

  function readOnlyWarning(action) {
    console.warn(`[PairSets] ${action} is disabled. Sets are bundled in sets/preloaded-sets.js.`);
    return false;
  }

  window.PairSets = {
    listSets,
    getSet,
    hasSet,
    pairsToTextarea,
    textareaToPairs,
    setCurrent,
    getCurrent,

    // Backward-compatible no-ops for older pages or stale event handlers.
    saveSet: () => readOnlyWarning('saveSet'),
    appendToSet: () => readOnlyWarning('appendToSet'),
    deleteSet: () => readOnlyWarning('deleteSet'),
    exportAll: () => readOnlyWarning('exportAll'),
    importFromFile: async () => readOnlyWarning('importFromFile')
  };

  try { console.log('[PairSets] preloaded sets ready:', listSets()); } catch {}
})();
