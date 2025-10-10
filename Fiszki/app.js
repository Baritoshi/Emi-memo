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
  const startBtn    = byId('startBtn');     // start z SRS
  const oneOffBtn   = byId('oneOffBtn');    // NOWOŚĆ: sesja jednorazowa
  const reviewBtn   = byId('reviewBtn');    // karty „na dziś”
  const clearReviewBtn = byId('clearReviewBtn');
  const srsDetailsBtn  = byId('srsDetailsBtn');

  // SRS summary + details
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
  function findIndex(arr, card) { return arr.findIndex(x => keyOf(x) === keyOf(card)); }

  function ensureEntry(card) {
    const arr = readAll();
    const idx = findIndex(arr, card);
    if (idx >= 0) return { arr, idx };
    const entry = {
      term: card.term, meaning: card.meaning,
      box: 1, dueAt: Date.now() + INTERVALS_DAYS[1] * DAY_MS
    };
    arr.push(entry); writeAll(arr);
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
  }

  /* -------------- stan gry -------------- */
  let deck = [];          // [{ term, meaning, failedBefore }]
  let queue = [];
  let current = null;
  let revealed = false;
  let firstTryCount = 0;
  let totalCards = 0;

  // NOWOŚĆ: tryb sesji: 'srs' | 'oneoff' | 'review'
  let sessionMode = 'srs';

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
    document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.style.display='none'; });
    view.classList.add('active'); view.style.display='block';
  }

  function updateProgress(){
    const remaining = queue.length + (current ? 1 : 0);
    const modeHint = sessionMode === 'oneoff' ? '• Tryb: jednorazowy' :
                     sessionMode === 'review' ? '• Tryb: powtórka' : '• Tryb: z pamięcią';
    progressEl.textContent = `Pozostało: ${remaining} • Za 1. razem: ${firstTryCount} ${modeHint}`;
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

  function startWithPairs(pairs, mode){
    sessionMode = mode;           // 'srs' | 'oneoff' | 'review'
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

  function startGameFromText(text, mode){
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
    startWithPairs(pairs, mode);
  }

  function startReviewMode(){
    const due = getDueNow();
    if(due.length === 0){
      setupError.classList.remove('hidden');
      setupError.textContent = 'Brak kart „na dziś” w SRS.';
      return;
    }
    setupError.classList.add('hidden');
    startWithPairs(due.map(({term, meaning}) => ({term, meaning})), 'review');
  }

  /* -------------- zdarzenia -------------- */
  startBtn.addEventListener('click', () => startGameFromText(input?.value ?? '', 'srs'));
  oneOffBtn.addEventListener('click', () => startGameFromText(input?.value ?? '', 'oneoff'));
  reviewBtn.addEventListener('click', startReviewMode);
  clearReviewBtn.addEventListener('click', () => { storage.clear(); updateReviewBadge(); refreshSrsSummary(); });

  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      // Ctrl+Enter domyślnie z pamięcią
      startGameFromText(input.value, 'srs');
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

  // Nawigacja widoków
  function refreshAllBadges(){ updateReviewBadge(); refreshSrsSummary(); }
  byId('backBtn').addEventListener('click', ()=> { show(setupView); refreshAllBadges(); });
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
    show(setupView); refreshAllBadges();
  });

  // Klik karty — odsłoń
  flashcard.addEventListener('click', ()=> { if(current) setRevealed(true); });
  actions.addEventListener('click', (e)=> e.stopPropagation());

  // Odpowiedzi
  knowBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(!revealed) return;

    if (!current.failedBefore) firstTryCount++;

    // SRS tylko gdy nie jesteśmy w one-off
    if (sessionMode !== 'oneoff') {
      if (sessionMode === 'srs' || sessionMode === 'review') {
        promote(current);
      }
    }
    nextCard();
  });

  dontKnowBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(!revealed) return;

    current.failedBefore = true;

    // W każdej sesji w tej rundzie karta wraca na koniec:
    queue.push(current);

    // SRS tylko gdy nie jesteśmy w one-off
    if (sessionMode !== 'oneoff') {
      if (sessionMode === 'srs' || sessionMode === 'review') {
        demote(current); // Box 1, due +1 dzień
      }
    }
    nextCard();
  });

  // Skróty klawiszowe
  document.addEventListener('keydown', (e)=>{
    if(!gameView.classList.contains('active')) return;
    if(!current && e.code!=='Escape') return;
    if(e.code==='Space'){ e.preventDefault(); setRevealed(true); }
    if(e.code==='KeyJ'){ e.preventDefault(); if(revealed) knowBtn.click(); }
    if(e.code==='KeyF'){ e.preventDefault(); if(revealed) dontKnowBtn.click(); }
    if(e.code==='Escape'){ e.preventDefault(); byId('backBtn').click(); }
  });

  // start: odśwież liczniki SRS
  updateReviewBadge();
  refreshSrsSummary();
});
