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

    // Import/Export
    const exportBtn = $('exportBtn');
    const importBtn = $('importBtn');
    const importFile = $('importFile');

    // Lenient
    const lenientToggle = $('lenientToggle');
    const toleranceRange = $('toleranceRange');
    const toleranceLabel = $('toleranceLabel');

    // Losowanie
    const shuffleToggle = $('shuffleToggle');
    const sampleCountEl = $('sampleCount');

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

    // Stats UI
    const finishLead = $('finishLead');
    const statFirstTry = $('statFirstTry');
    const statTotal = $('statTotal');
    const statPercent = $('statPercent');
    const statDuration = $('statDuration');
    const statTotalAttempts = $('statTotalAttempts');
    const statAvgAttempts = $('statAvgAttempts');

    /* ---------- SRS ---------- */
    const STORAGE_KEY = 'flash_srs_v1';
    const MAX_BOX = 5;
    const DAY_MS = 86400000;
    const INTERVALS_DAYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };
    const MAX_SESSION_CARDS = 15;

    const storage = {
        get() { try { const a = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(a) ? a.filter(x => x && x.term && x.meaning) : []; } catch { return []; } },
        set(a) { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); },
        clear() { localStorage.removeItem(STORAGE_KEY); }
    };

    const prefsKey = 'quiz_prefs_v1';
    const prefs = {
        get() { try { return JSON.parse(localStorage.getItem(prefsKey)) ?? { lenient: true, tol: 2 }; } catch { return { lenient: true, tol: 2 }; } },
        set(p) { localStorage.setItem(prefsKey, JSON.stringify(p)); }
    };

    // Init lenient UI
    (() => {
        const p = prefs.get();
        if (lenientToggle) lenientToggle.checked = !!p.lenient;
        if (toleranceRange) toleranceRange.value = String(p.tol ?? 2);
        if (toleranceLabel) toleranceLabel.textContent = String(p.tol ?? 2);

        lenientToggle?.addEventListener('change', () => {
            const cur = prefs.get(); prefs.set({ ...cur, lenient: !!lenientToggle.checked });
        });
        toleranceRange?.addEventListener('input', () => toleranceLabel.textContent = toleranceRange.value);
        toleranceRange?.addEventListener('change', () => {
            const cur = prefs.get(); prefs.set({ ...cur, tol: parseInt(toleranceRange.value, 10) || 0 });
        });
    })();

    // Normalizacja / porównanie
    function canon(s) {
        return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
    }
    function editDistance(a, b) {
        const m = a.length, n = b.length; if (m === 0) return n; if (n === 0) return m;
        const dp = new Array(n + 1); for (let j = 0; j <= n; j++) dp[j] = j;
        for (let i = 1; i <= m; i++) {
            let prev = dp[0]; dp[0] = i;
            for (let j = 1; j <= n; j++) {
                const t = dp[j];
                dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t;
            }
        } return dp[n];
    }
    function isCorrectAnswer(user, expected) {
        const variants = String(expected || '').split('|').map(v => v.trim()).filter(Boolean);
        if (variants.length === 0) return false;
        const p = prefs.get(); const tol = Math.max(0, Math.min(3, parseInt(p.tol, 10) || 0));
        const u = canon(user);
        if (!p.lenient) { return variants.some(v => u === canon(v)); }
        return variants.some(v => { const e = canon(v); return u === e || editDistance(u, e) <= tol; });
    }

    const keyOf = (c) => `${canon(c.term)}|${canon(c.meaning)}`;
    const readAll = () => storage.get();
    const writeAll = (a) => { storage.set(a); updateReviewBadge(); };
    const dueNowCount = () => { const now = Date.now(); return readAll().filter(e => (e.dueAt ?? 0) <= now).length; };
    const getDueNow = () => { const now = Date.now(); return readAll().filter(e => (e.dueAt ?? 0) <= now); };
    const findIndex = (arr, card) => arr.findIndex(x => keyOf(x) === keyOf(card));
    function ensureEntry(card) {
        const arr = readAll(); const idx = findIndex(arr, card);
        if (idx >= 0) return { arr, idx };
        const entry = { term: card.term, meaning: card.meaning, box: 1, dueAt: Date.now() + INTERVALS_DAYS[1] * DAY_MS };
        arr.push(entry); writeAll(arr); return { arr, idx: arr.length - 1 };
    }
    function promote(card) {
        const all = readAll(); const idx = findIndex(all, card); if (idx < 0) return;
        const e = all[idx]; e.box = Math.min(MAX_BOX, (e.box || 1) + 1); e.dueAt = Date.now() + INTERVALS_DAYS[e.box] * DAY_MS; writeAll(all);
    }
    function demote(card) {
        const { arr, idx } = ensureEntry(card); const e = arr[idx]; e.box = 1; e.dueAt = Date.now() + INTERVALS_DAYS[1] * DAY_MS; writeAll(arr);
    }
    function updateReviewBadge() { if (reviewBtn) reviewBtn.textContent = `Tryb powtórki (${dueNowCount()})`; }

    /* Import/Export (merge) */
    const EXPORT_SCHEMA = 'leitner-srs@1';
    function tsISO(d = new Date()) { return d.toISOString(); }
    function downloadBlob(filename, data) {
        const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }
    function sanitizeCards(arr) {
        return (Array.isArray(arr) ? arr : []).filter(x => x && typeof x.term === 'string' && typeof x.meaning === 'string')
            .map(x => ({
                term: String(x.term), meaning: String(x.meaning),
                box: Math.min(5, Math.max(1, parseInt(x.box, 10) || 1)),
                dueAt: Number.isFinite(+x.dueAt) ? parseInt(x.dueAt, 10) : Date.now()
            }));
    }
    function exportSRS(name = 'Zestaw SRS') {
        const payload = { schema: EXPORT_SCHEMA, meta: { datasetName: name, exportedAt: tsISO() }, cards: readAll() };
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        downloadBlob(`srs-export-${stamp}.json`, JSON.stringify(payload, null, 2));
    }
    async function importSRSFile(file) {
        if (!file) return;
        try {
            const json = JSON.parse(await file.text());
            if (json?.schema !== EXPORT_SCHEMA) { alert('Nieprawidłowy plik (schema).'); return; }
            const incoming = sanitizeCards(json.cards); if (incoming.length === 0) { alert('Brak kart do importu.'); return; }

            const existing = readAll(); const map = new Map(existing.map(c => [keyOf(c), c]));
            let added = 0, updated = 0;
            for (const inc of incoming) {
                const k = keyOf(inc);
                if (map.has(k)) {
                    const ex = map.get(k);
                    map.set(k, {
                        term: ex.term, meaning: ex.meaning,
                        box: Math.max(ex.box || 1, inc.box || 1),
                        dueAt: Math.min(Number.isFinite(+ex.dueAt) ? +ex.dueAt : Date.now(),
                            Number.isFinite(+inc.dueAt) ? +inc.dueAt : Date.now())
                    });
                    updated++;
                } else { map.set(k, inc); added++; }
            }
            const merged = Array.from(map.values());
            storage.set(merged); updateReviewBadge();
            alert(`Import zakończony.\nZestaw: ${json?.meta?.datasetName || 'bez nazwy'}\nWczytano: ${incoming.length}\nDodano: ${added}\nZaktualizowano: ${updated}\nRazem: ${merged.length}`);
        } catch (err) { console.error(err); alert('Import nieudany.'); }
        finally { if (importFile) importFile.value = ''; }
    }
    exportBtn?.addEventListener('click', () => { const n = prompt('Nazwa zestawu:', 'Mój zestaw'); exportSRS(n || 'Mój zestaw'); });
    importBtn?.addEventListener('click', () => importFile?.click());
    importFile?.addEventListener('change', (e) => importSRSFile(e.target.files?.[0]));

    /* Losowanie */
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
        return arr;
    }
    function sampleArray(arr, n) {
        if (n == null || isNaN(n)) return arr.slice();
        n = Math.max(1, Math.min(MAX_SESSION_CARDS, Math.floor(n)));
        if (n >= arr.length) return arr.slice();
        const copy = arr.slice();
        for (let i = copy.length - 1; i > copy.length - 1 - n; i--) {
            const j = Math.floor(Math.random() * (i + 1));[copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(copy.length - n);
    }

    /* Stan gry */
    let deck = [], queue = [], current = null, answered = false, wasCorrect = null;
    let firstTryCount = 0, totalCards = 0, sessionStart = 0, totalAttempts = 0;
    let sessionMode = 'srs';

    function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function parseInput(text) {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const pairs = []; const errors = [];
        lines.forEach((line, idx) => {
            const parts = line.split(';'); if (parts.length < 2) { errors.push(idx + 1); return; }
            const term = parts[0].trim(); const meaning = parts.slice(1).join(';').trim();
            if (!term || !meaning) { errors.push(idx + 1); return; }
            pairs.push({ term, meaning });
        });
        return { pairs, errors };
    }

    function showLimitMessage(pairs) {
        const over = pairs.length - MAX_SESSION_CARDS;
        const extra = pairs.slice(MAX_SESSION_CARDS, MAX_SESSION_CARDS + 10)
            .map(p => `&bull; ${escapeHtml(p.term)} — ${escapeHtml(p.meaning)}`).join('<br>');
        setupError.classList.remove('hidden');
        setupError.innerHTML = `Masz ${pairs.length} par, limit to ${MAX_SESSION_CARDS}. Usuń ${over} i spróbuj ponownie.` + (extra ? `<br><br>Nadmiar (pierwsze 10):<br>${extra}` : '');
    }

    function prepareDeck(allPairs) {
        let pairs = allPairs.slice(); if (pairs.length === 0) return [];
        const nRaw = sampleCountEl?.value?.trim();
        const n = nRaw ? Math.min(MAX_SESSION_CARDS, Math.max(1, parseInt(nRaw, 10) || 1)) : null;

        if (shuffleToggle?.checked) { shuffle(pairs); }
        if (n) { pairs = sampleArray(pairs, n); }

        if (pairs.length > MAX_SESSION_CARDS) { showLimitMessage(pairs); return []; }
        return pairs;
    }

    function show(view) {
        document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.style.display = 'none'; });
        view.classList.add('active'); view.style.display = 'block';
    }
    function updateProgress() {
        const remaining = queue.length + (current ? 1 : 0);
        const modeHint = sessionMode === 'oneoff' ? '• Tryb: jednorazowy' : sessionMode === 'review' ? '• Tryb: powtórka' : '• Tryb: z pamięcią';
        progressEl.textContent = `Pozostało: ${remaining} • Za 1. razem: ${firstTryCount} ${modeHint}`;
    }
    function loadCard(card) {
        current = card || null; if (!current) { finish(); return; }
        answered = false; wasCorrect = null;
        questionTerm.textContent = current.term;
        feedback.classList.add('hidden'); feedback.textContent = '';
        nextBtn.classList.add('hidden'); checkBtn.disabled = false;
        answerInput.value = ''; answerInput.focus();
        updateProgress();
    }
    function nextCard() { if (queue.length === 0) { loadCard(null); return; } loadCard(queue.shift()); }
    function fmtDuration(ms) { const s = Math.max(0, Math.floor(ms / 1000)); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; }
    function finish() {
        const durationMs = Date.now() - sessionStart;
        gameArea.classList.add('hidden'); finishArea.classList.remove('hidden');
        const pct = totalCards ? Math.round((firstTryCount / totalCards) * 100) : 0;
        const avg = totalCards ? (totalAttempts / totalCards) : 0;
        finishLead.textContent = `Wszystkie fiszki zaliczone. Trafienia za 1. razem: ${firstTryCount}/${totalCards} (${pct}%).`;
        statFirstTry.textContent = String(firstTryCount);
        statTotal.textContent = String(totalCards);
        statPercent.textContent = `${pct}%`;
        statDuration.textContent = fmtDuration(durationMs);
        statTotalAttempts.textContent = String(totalAttempts);
        statAvgAttempts.textContent = avg.toFixed(2);
        updateReviewBadge();
    }

    function startWithPairs(pairs, mode) {
        const prepared = prepareDeck(pairs);
        if (prepared.length === 0) return;

        sessionMode = mode;
        deck = prepared.map(p => ({ ...p, failedBefore: false, attempts: 0 }));
        queue = deck.slice(); totalCards = deck.length;
        firstTryCount = 0; totalAttempts = 0; sessionStart = Date.now();

        gameArea.classList.remove('hidden'); finishArea.classList.add('hidden');
        show(gameView); nextCard();
    }

    function startGameFromText(text, mode) {
        const { pairs, errors } = parseInput(text);
        if (errors.length) { setupError.classList.remove('hidden'); setupError.textContent = `Błąd w wierszach: ${errors.join(', ')}`; return; }
        if (pairs.length === 0) { setupError.classList.remove('hidden'); setupError.textContent = 'Dodaj przynajmniej jedną parę.'; return; }
        // twardy limit jeżeli user nie poda N i wklei >15
        if (!sampleCountEl?.value && pairs.length > MAX_SESSION_CARDS) { showLimitMessage(pairs); return; }
        setupError.classList.add('hidden'); startWithPairs(pairs, mode);
    }

    function startReviewMode() {
        const due = getDueNow(); if (due.length === 0) { setupError.classList.remove('hidden'); setupError.textContent = 'Brak kart „na dziś” w SRS.'; return; }
        const pairs = due.map(({ term, meaning }) => ({ term, meaning }));
        if (!sampleCountEl?.value && pairs.length > MAX_SESSION_CARDS) { showLimitMessage(pairs); return; }
        setupError.classList.add('hidden'); startWithPairs(pairs, 'review');
    }

    // submit
    answerForm.addEventListener('submit', (e) => {
        e.preventDefault(); if (!current || answered) return;
        const ok = isCorrectAnswer(answerInput.value, current.meaning);
        wasCorrect = ok; answered = true;

        current.attempts = (current.attempts || 0) + 1; totalAttempts++;

        if (ok) {
            feedback.textContent = '✅ Dobrze!'; feedback.classList.remove('hidden');
            if (!current.failedBefore) firstTryCount++;
            if (sessionMode !== 'oneoff') promote(current);
        } else {
            feedback.textContent = `❌ Źle. Poprawna odpowiedź: ${current.meaning}`; feedback.classList.remove('hidden');
            current.failedBefore = true; queue.push(current);
            if (sessionMode !== 'oneoff') demote(current);
        }
        checkBtn.disabled = true; nextBtn.classList.remove('hidden'); nextBtn.focus();
    });
    nextBtn.addEventListener('click', () => { nextBtn.classList.add('hidden'); nextCard(); });

    // hotkeys
    document.addEventListener('keydown', (e) => {
        if (!gameView.classList.contains('active')) return;
        if (e.code === 'Escape') { e.preventDefault(); backBtn.click(); return; }
        if (e.code === 'Enter') {
            if (document.activeElement !== answerInput && !answered) { e.preventDefault(); answerForm.requestSubmit(); }
            else if (answered) { e.preventDefault(); nextBtn.click(); }
        }
    });

    // start
    startBtn?.addEventListener('click', () => startGameFromText(inputPairs?.value ?? '', 'srs'));
    oneOffBtn?.addEventListener('click', () => startGameFromText(inputPairs?.value ?? '', 'oneoff'));
    reviewBtn?.addEventListener('click', startReviewMode);
    clearReviewBtn?.addEventListener('click', () => { storage.clear(); updateReviewBadge(); });

    sampleBtn?.addEventListener('click', () => {
        inputPairs.value = `engine; silnik|motor
wheel; koło
wrench; klucz
spark plug; świeca zapłonowa`;
        inputPairs.focus();
    });

    backBtn?.addEventListener('click', () => { show(setupView); updateReviewBadge(); });

    // „Zagraj ponownie” — ta sama talia, od początku (POPRAWIONE)
    againBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        deck.forEach(c => { c.failedBefore = false; c.attempts = 0; });
        queue = deck.slice();           // pełna kolejka
        firstTryCount = 0;
        totalAttempts = 0;
        sessionStart = Date.now();

        gameArea.classList.remove('hidden');
        finishArea.classList.add('hidden');
        nextCard();                     // załaduj pierwszą kartę
    });

    // „Nowa talia” — powrót do ekranu startowego (POPRAWIONE)
    restartBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        show(setupView);
        setupError?.classList.add('hidden');
        updateReviewBadge();
    });

    updateReviewBadge();
});
