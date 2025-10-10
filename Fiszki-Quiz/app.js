document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);

  // Views & setup
  const setupView = $('setupView');
  const gameView = $('gameView');
  const inputPairs = $('inputPairs');
  const setupError = $('setupError');
  const startBtn = $('startBtn');
  const oneOffBtn = $('oneOffBtn');
  const reviewBtn = $('reviewBtn');
  const clearReviewBtn = $('clearReviewBtn');
  const sampleBtn = $('sampleBtn');

  // Game UI
  const progressEl = $('progress');
  const backBtn = $('backBtn');
  const questionTerm = $('questionTerm');
  const answerForm = $('answerForm');
  const answerInput = $('answerInput');
  const checkBtn = $('checkBtn');
  const nextBtn = $('nextBtn');
  const feedback = $('feedback');
  const gameArea = $('gameArea');
  const finishArea = $('finishArea');
  const againBtn = $('againBtn');
  const restartBtn = $('restartBtn');

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

  // --- Normalizacja i "łagodne" porównanie ---
  // 1) Kanonizacja: małe litery, bez diakrytyków, bez interpunkcji, spacje zwinięte
  function canon(s){
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')                 // rozbij znaki z akcentami
      .replace(/[\u0300-\u036f]/g, '')  // usuń diakrytyki
      .replace(/[^\p{L}\p{N}\s]/gu, '') // usuń interpunkcję/znaki specjalne
      .replace(/\s+/g, ' ')             // zwin wielokrotne spacje
      .trim();
  }

  // 2) Dystans Levenshteina (prosta wersja)
  function editDistance(a, b){
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const temp = dp[j];
        dp[j] = Math.min(
          dp[j] + 1,                    // deletion
          dp[j - 1] + 1,                // insertion
          prev + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
        );
        prev = temp;
      }
    }
    return dp[n];
  }

  // 3) Próg literówek zależny od długości (łagodne dopasowanie)
  function typoThreshold(len){
    if (len <= 5) return 1;
    if (len <= 10) return 2;
    return 3;
  }

  // 4) Porównanie: akceptuj idealny kanon lub podobny w granicach progu
  function similarEnough(userRaw, expectedRaw){
    const u = canon(userRaw);
    const e = canon(expectedRaw);
    if (!u && !e) return true;
    if (u === e) return true;
    const dist = editDistance(u, e);
    return dist <= typoThreshold(Math.max(u.length, e.length));
  }

  // 5) Wiele poprawnych odpowiedzi po "|"
  function isCorrectAnswer(user, expected){
    const variants = String(expected || '')
      .split('|')
      .map(v => v.trim())
      .filter(Boolean);
    if (variants.length === 0) return false;
    return variants.some(v => similarEnough(user, v));
  }

  const keyOf = (c) => `${canon(c.term)}|${canon(c.meaning)}`;

  function readAll() { return storage.get(); }
  function writeAll(arr) { storage.set(arr); updateReviewBadge(); }
  function dueNowCount() {
    const now = Date.now();
    return readAll().filter(e => (e.dueAt ?? 0) <= now).length;
  }
  function getDueNow() {
    const now = Date.now();
    return readAll().filter(e => (e.dueAt ?? 0) <= now);
  }
  function findIndex(arr, card) { return arr.findIndex(x => keyOf(x) === keyOf(card)); }
  function ensureEntry(card) {
    const arr = readAll();
    const idx = findIndex(arr, card);
    if (idx >= 0) return { arr, idx };
    const entry = { term: card.term, meaning: card.meaning, box: 1, dueAt: Date.now() + INTERVALS_DAYS[1] * DAY_MS };
    arr.push(entry); writeAll(arr); return { arr, idx: arr.length - 1 };
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
  function updateReviewBadge() {
    if (reviewBtn) reviewBtn.textContent = `Tryb powtórki (${dueNowCount()})`;
  }

  /* -------------- stan gry -------------- */
  let deck = [];        // [{ term, meaning, failedBefore }]
  let queue = [];
  let current = null;
  let answered = false;
  let wasCorrect = null;
  let firstTryCount = 0;
  let totalCards = 0;

  // tryby: 'srs' | 'oneoff' | 'review'
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

  function loadCard(card){
    current = card || null;
    if(!current){ finish(); return; }
    answered = false; wasCorrect = null;
    questionTerm.textContent = current.term;
    feedback.classList.add('hidden');
    feedback.textContent = '';
    nextBtn.classList.add('hidden');
    checkBtn.disabled = false;
    answerInput.value = '';
    answerInput.focus();
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
    updateReviewBadge();
  }

  function startWithPairs(pairs, mode){
    sessionMode = mode;
    deck = pairs.map(p => ({ ...p, failedBefore: false }));
    queue = deck.slice();
    totalCards = deck.length;
    firstTryCount = 0;

    gameArea.classList.remove('hidden');
    finishArea.classList.add('hidden');

    show(gameView);
    nextCard();
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
  startBtn.addEventListener('click', () => startGameFromText(inputPairs?.value ?? '', 'srs'));
  oneOffBtn.addEventListener('click', () => startGameFromText(inputPairs?.value ?? '', 'oneoff'));
  reviewBtn.addEventListener('click', startReviewMode);
  clearReviewBtn.addEventListener('click', () => { storage.clear(); updateReviewBadge(); });

  sampleBtn.addEventListener('click', ()=>{
    inputPairs.value = `engine; silnik|motor
wheel; koło
wrench; klucz
spark plug; świeca zapłonowa`;
    inputPairs.focus();
  });

  $('backBtn').addEventListener('click', ()=> { show(setupView); updateReviewBadge(); });

  againBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    deck.forEach(c => c.failedBefore = false);
    queue = deck.slice();
    firstTryCount = 0;
    gameArea.classList.remove('hidden');
    finishArea.classList.add('hidden');
    nextCard();
  });
  restartBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    show(setupView);
    updateReviewBadge();
  });

  // submit odpowiedzi
  answerForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!current || answered) return;

    const userAns = answerInput.value;
    const ok = isCorrectAnswer(userAns, current.meaning);
    wasCorrect = ok;
    answered = true;

    // feedback
    if (ok) {
      feedback.textContent = '✅ Dobrze!';
      feedback.classList.remove('hidden');
      if (!current.failedBefore) firstTryCount++;
      if (sessionMode !== 'oneoff') promote(current);
    } else {
      feedback.textContent = `❌ Źle. Poprawna odpowiedź: ${current.meaning}`;
      feedback.classList.remove('hidden');
      current.failedBefore = true;
      queue.push(current);
      if (sessionMode !== 'oneoff') demote(current);
    }

    checkBtn.disabled = true;
    nextBtn.classList.remove('hidden');
    nextBtn.focus();
  });

  // następna karta
  nextBtn.addEventListener('click', ()=>{
    nextBtn.classList.add('hidden');
    nextCard();
  });

  // skróty klawiaturowe
  document.addEventListener('keydown', (e)=>{
    if(!gameView.classList.contains('active')) return;
    if(e.code === 'Escape'){ e.preventDefault(); backBtn.click(); return; }
    if(e.code === 'Enter'){
      if (document.activeElement !== answerInput && !answered) {
        e.preventDefault();
        answerForm.requestSubmit();
      } else if (!answered) {
        // naturalny submit z inputa
      } else {
        e.preventDefault();
        nextBtn.click();
      }
    }
  });

  // start
  updateReviewBadge();
});
