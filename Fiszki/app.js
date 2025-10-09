document.addEventListener('DOMContentLoaded', () => {
  const byId = (id) => document.getElementById(id);

  // Views
  const setupView   = byId('setupView');
  const gameView    = byId('gameView');
  const srsView     = byId('srsView');

  // Setup controls
  const input       = byId('inputPairs');
  const setupError  = byId('setupError');
  const sampleBtn   = byId('sampleBtn');
  const startBtn    = byId('startBtn');
  const reviewBtn   = byId('reviewBtn');
  const clearReviewBtn = byId('clearReviewBtn');
  const srsDetailsBtn  = byId('srsDetailsBtn');

  // SRS summary (on setup) + details (on srsView)
  const srsCountEl  = byId('srsCount');
  const srsDueEl    = byId('srsDue');
  const srsCount2   = byId('srsCount2');
  const srsDue2     = byId('srsDue2');
  const srsBackBtn  = byId('srsBackBtn');
  const srsTable    = byId('srsTable');

  // Game controls
  const progressEl  = byId('progress');
  const backBtn     = byId('backBtn');

  const gameArea    = byId('gameArea');
  const finishArea  = byId('finishArea');
  const againBtn    = byId('againBtn');
  const restartBtn  = byId('restartBtn');

  const flashcard   = byId('flashcard');
  const card3d      = byId('card3d');
  const frontText   = byId('frontText');
  const backText    = byId('backText');
  const actions     = byId('actions');
  const knowBtn     = byId('knowBtn');
  const dontKnowBtn = byId('dontKnowBtn');

  /* ---------- SRS Leitner (5 pudełek, dni: 1,2,4,8,16) ---------- */
  const STORAGE_KEY = 'flash_srs_v1';
  const MAX_BOX = 5;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const INTERVALS_DAYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

  const storage = {
    get() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.filter(x => x && x.term && x.meaning) : [];
      } catch { return []; }
    },
    set(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); },
    clear()  { localStorage.removeItem(STORAGE_KEY); }
  };

  const normalize = (s) => (s || '').trim().toLowerCase();
  const keyOf = (c) => `${normalize(c.term)}|${normalize(c.meaning)}`;

  function readAll() { return storage.get(); }
  function writeAll(arr) { storage.set(arr); updateReviewBadge(); refreshSrsSummary(); }

  function findIndex(arr, card) {
    const k = keyOf(card);
    return arr.findIndex(x => keyOf(x) === k);
  }

  function ensureEntry(card) {
    const arr = readAll();
    const idx = findIndex(arr, card);
    if (idx >= 0) return { arr, idx };
    const entry = {
      term: card.term,
      meaning: card.meaning,
      box: 1,
      dueAt: Date.now() + INTERVALS_DAYS[1] * DAY_MS
    };
    arr.push(entry);
    writeAll(arr);
    return { arr, idx: arr.length - 1 };
  }

  function promote(card) {
    const all = readAll();
    const idx = findIndex(all, card);
    if (idx < 0) return;
    const e = all[idx];
    e.box = Math.min(MAX_BOX, (e.box || 1) + 1);
    e.dueAt = Date.now() + INTERVALS_DAYS[e.box] * DAY_MS;
    writeAll(all);
  }

  function demote(card) {
    const { arr, idx } = ensureEntry(card);
    const e = arr[idx];
    e.box = 1;
    e.dueAt = Date.now() + INTERVALS_DAYS[1] * DAY_MS;
    writeAll(arr);
  }

  function removeFromSrs(card) {
    const all = readAll();
    const idx = findIndex(all, card);
    if (idx >= 0) {
      all.splice(idx, 1);
      writeAll(all);
    }
  }

  function dueNowCount() {
    const now = Date.now();
    return readAll().filter(e => (e.dueAt ?? 0) <= now).length;
  }

  function getDueNow() {
    const now = Date.now();
    return readAll().filter(e => (e.dueAt ?? 0) <= now);
  }

  function updateReviewBadge() {
    if (reviewBtn) reviewBtn.textContent = `Tryb powtórki (${dueNowCount()})`;
  }

  function refreshSrsSummary() {
    const total = readAll().length;
    const due = dueNowCount();
    if (srsCountEl) srsCountEl.textContent = String(total);
    if (srsDueEl)   srsDueEl.textContent   = String(due);
    updateReviewBadge();
  }

  /* -------------- stan gry -------------- */
  let deck = [];          // [{ term, meaning, failedBefore }]
  let queue = [];
  let current = null;
  let revealed = false;
  let firstTryCount = 0;
  let totalCards = 0;

  function parseInput(text){
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const pairs = []; const errors = [];
    lines.forEach((line,idx)=>{
      const parts = line.split(';');
      if(parts.length < 2){ errors.push(idx+1); return; }
      const term = parts[0].trim();
      const meaning = parts.slice(1).join(';').trim();
      if(!term || !meaning){ errors.push(idx+1); return; }
      pairs.push({ term, meaning });
    });
    return { pairs, errors };
  }

  function show(view){
    // „pancernie” wymuś display
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });
    view.classList.add('active');
    view.style.display = 'block';
  }

  function updateProgress(){
    const remaining = queue.length + (current ? 1 : 0);
    progressEl.textContent = `Pozostało: ${remaining} • Za 1. razem: ${firstTryCount}`;
  }

  function setRevealed(v){
    revealed = v;
    card3d.classList.toggle('revealed', revealed);
    actions.classList.toggle('hidden', !revealed);
  }

  function loadCard(card){
    current = card || null;
    if(!current){ finish(); return; }
    frontText.textContent = current.term;
    backText.textContent  = current.meaning;
    setRevealed(false);
    updateProgress();
  }

  function nextCard(){
    if(queue.length===0){ loadCard(null); return; }
    const n = queue.shift();
    loadCard(n);
  }

  function finish(){
    gameArea.classList.add('hidden');
    finishArea.classList.remove('hidden');
    const lead = finishArea.querySelector('.lead');
    if (lead) lead.textContent = `Wszystkie fiszki zaliczone. Trafienia za 1. razem: ${firstTryCount}/${totalCards}.`;
    updateProgress();
    updateReviewBadge();
    refreshSrsSummary();
  }

  function startWithPairs(pairs){
    deck = pairs.map(p => ({ ...p, failedBefore: false }));
    queue = deck.slice();
    totalCards = deck.length;
    firstTryCount = 0;

    gameArea.classList.remove('hidden');
    finishArea.classList.add('hidden');

    show(gameView);
    nextCard();
    flashcard.focus();
  }

  function startGameFromText(text){
    const {pairs, errors} = parseInput(text);
    if(errors.length){
      setupError.classList.remove('hidden');
      setupError.textContent = `Błąd w wierszach bez poprawnego separatora ';': ${errors.join(', ')}.`;
      return;
    }
    if(pairs.length===0){
      setupError.classList.remove('hidden');
      setupError.textContent = 'Dodaj przynajmniej jedną parę słówek.';
      return;
    }
    setupError.classList.add('hidden');
    startWithPairs(pairs);
  }

  function startReviewMode(){
    const due = getDueNow();
    if(due.length === 0){
      setupError.classList.remove('hidden');
      setupError.textContent = 'Brak kart „na dziś” w SRS.';
      return;
    }
    setupError.classList.add('hidden');
    startWithPairs(due.map(({term, meaning}) => ({term, meaning})));
  }

  /* ---- SRS DETAILS (tabela) ---- */
  function escapeHtml(s){
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }
  function fmtDate(ts){
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  }
  function buildSrsTable(){
    const data = readAll().slice().sort((a,b)=> (a.dueAt||0) - (b.dueAt||0));
    const tbody = srsTable.querySelector('tbody');
    tbody.innerHTML = '';
    for (const e of data){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(e.term)}</td>
        <td>${escapeHtml(e.meaning)}</td>
        <td>${e.box ?? 1}</td>
        <td>${fmtDate(e.dueAt)}</td>
      `;
      tbody.appendChild(tr);
    }
    if (srsCount2) srsCount2.textContent = String(data.length);
    if (srsDue2)   srsDue2.textContent   = String(dueNowCount());
  }

  /* -------------- zdarzenia -------------- */
  startBtn.addEventListener('click', () => startGameFromText(input?.value ?? ''));
  reviewBtn.addEventListener('click', startReviewMode);
  clearReviewBtn.addEventListener('click', () => { storage.clear(); updateReviewBadge(); refreshSrsSummary(); });

  srsDetailsBtn.addEventListener('click', () => { buildSrsTable(); show(srsView); });
  srsBackBtn.addEventListener('click', () => { show(setupView); refreshSrsSummary(); });

  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      startGameFromText(input.value);
    }
  });

  sampleBtn.addEventListener('click', ()=>{
    input.value = `engine; silnik
wheel; koło
wrench; klucz
spark plug; świeca zapłonowa
brake pad; klocek hamulcowy
screwdriver; śrubokręt
fuse; bezpiecznik
coolant; płyn chłodniczy`;
    input.focus();
  });

  backBtn.addEventListener('click', ()=> { show(setupView); updateReviewBadge(); refreshSrsSummary(); });
  againBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    firstTryCount = 0;
    deck.forEach(c => c.failedBefore = false);
    queue = deck.slice();
    gameArea.classList.remove('hidden');
    finishArea.classList.add('hidden');
    nextCard();
  });
  restartBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    show(setupView);
    updateReviewBadge();
    refreshSrsSummary();
  });

  // Kliknięcie karty — tylko odkryj
  flashcard.addEventListener('click', ()=>{
    if(!current) return;
    setRevealed(true);
  });

  // Zatrzymaj bąbelkowanie klików z przycisków
  actions.addEventListener('click', (e)=> e.stopPropagation());

  knowBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(!revealed) return;

    if (!current.failedBefore) firstTryCount++;

    promote(current);      // aktualizacja SRS
    nextCard();
  });

  dontKnowBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(!revealed) return;

    current.failedBefore = true;

    demote(current);       // Box 1, due +1 dzień
    queue.push(current);   // wraca jeszcze w tej sesji
    nextCard();
  });

  // Skróty klawiszowe
  document.addEventListener('keydown', (e)=>{
    if(!gameView.classList.contains('active')) return;
    if(!current && e.code!=='Escape') return;
    if(e.code==='Space'){ e.preventDefault(); setRevealed(true); }
    if(e.code==='KeyJ'){ e.preventDefault(); if(revealed) knowBtn.click(); }
    if(e.code==='KeyF'){ e.preventDefault(); if(revealed) dontKnowBtn.click(); }
    if(e.code==='Escape'){ e.preventDefault(); backBtn.click(); }
  });

  // start: odśwież liczniki SRS
  updateReviewBadge();
  refreshSrsSummary();
});
