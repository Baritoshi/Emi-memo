// sets-helper.js — wspólny menedżer zestawów dla wszystkich gier
// API: PairSets.listSets(), getSet(name), saveSet(name, pairs[]), deleteSet(name)
//      pairsToTextarea(pairs[]), textareaToPairs(text)
//      setCurrent(name), getCurrent()

(function () {
  const SETS_KEY = 'pairsets_v1';
  const CUR_KEY  = 'pairsets_v1:current'; // { name, ts }

  function safeParse(json, fallback) {
    try { return JSON.parse(json); } catch { return fallback; }
  }
  function loadAll() {
    const obj = safeParse(localStorage.getItem(SETS_KEY), {});
    return (obj && typeof obj === 'object') ? obj : {};
  }
  function saveAll(map) {
    localStorage.setItem(SETS_KEY, JSON.stringify(map));
    // powiadom inne widoki
    window.dispatchEvent(new Event('pairsets:changed'));
  }

  function listSets() {
    return Object.keys(loadAll()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity:'base' }));
  }
  function getSet(name) {
    const all = loadAll();
    return Array.isArray(all[name]) ? all[name] : [];
  }
  function saveSet(name, pairs) {
    const all = loadAll();
    all[name] = Array.isArray(pairs) ? pairs : [];
    saveAll(all);
  }
  function deleteSet(name) {
    const all = loadAll();
    delete all[name];
    saveAll(all);
  }

  function pairsToTextarea(pairs) {
    return (pairs || []).map(p => `${p.term}; ${p.meaning}`).join('\n');
  }
  function textareaToPairs(text) {
    const out = [];
    (text || '').split(/\r?\n/).forEach(line => {
      const t = line.trim(); if (!t) return;
      const parts = t.split(';'); if (parts.length < 2) return;
      const term = parts[0].trim();
      const meaning = parts.slice(1).join(';').trim();
      if (term && meaning) out.push({ term, meaning });
    });
    return out;
  }

  // Bieżący wybór zestawu (dla “kliknij w grze → załaduj mi ten sam set”)
  function setCurrent(name) {
    const payload = { name: String(name || ''), ts: Date.now() };
    localStorage.setItem(CUR_KEY, JSON.stringify(payload));
    // własny event (działa w tej karcie), plus event storage (między kartami)
    window.dispatchEvent(new Event('pairsets:current'));
  }
  function getCurrent() {
    const cur = safeParse(localStorage.getItem(CUR_KEY), null);
    return cur && typeof cur.name === 'string' && cur.name ? cur.name : null;
  }

  // propagacja zmian między kartami
  window.addEventListener('storage', (e) => {
    if (e.key === SETS_KEY)  window.dispatchEvent(new Event('pairsets:changed'));
    if (e.key === CUR_KEY)   window.dispatchEvent(new Event('pairsets:current'));
  });

  // Expose
  window.PairSets = {
    listSets, getSet, saveSet, deleteSet,
    pairsToTextarea, textareaToPairs,
    setCurrent, getCurrent
  };

  // Log diagnostyczny
  try {
    console.log('[PairSets] ready. Zestawy:', listSets());
  } catch {}
})();
