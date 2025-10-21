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

    // Import/Export controls
    const exportBtn = $('exportBtn');
    const importBtn = $('importBtn');
    const importFile = $('importFile');

    // Lenient toggle
    const lenientToggle = $('lenientToggle');
    const toleranceRange = $('toleranceRange');
    const toleranceLabel = $('toleranceLabel');

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
    const STORAGE_KEY = 'flash_srs_v1'; // wspólna baza z klasycznymi fiszkami
    const MAX_BOX = 5;
    const DAY_MS = 24 * 60 * 60 * 1000;
    const INTERVALS_DAYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

    // Preferencje porównywania
    const PREFS_KEY = 'quiz_prefs_v1';

    const storage = {
        get() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                const arr = JSON.parse(raw);
                return Array.isArray(arr) ? arr.filter(x => x && x.term && x.meaning) : [];
            } catch { return []; }
        },
        set(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); },
        clear() { localStorage.removeItem(STORAGE_KEY); }
    };

    const prefs = {
        get() {
            try { return JSON.parse(localStorage.getItem(PREFS_KEY)) ?? { lenient: true, tol: 2 }; }
            catch { return { lenient: true, tol: 2 }; }
        },
        set(p) { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }
    };

    // Inicjalizacja UI preferencji
    (function initPrefsUI() {
        const p = prefs.get();
        if (lenientToggle) lenientToggle.checked = !!p.lenient;
        if (toleranceRange) toleranceRange.value = String(p.tol ?? 2);
        if (toleranceLabel) toleranceLabel.textContent = String(p.tol ?? 2);

        lenientToggle?.addEventListener('change', () => {
            const cur = prefs.get();
            const next = { ...cur, lenient: !!lenientToggle.checked };
            prefs.set(next);
        });
        toleranceRange?.addEventListener('input', () => {
            toleranceLabel.textContent = toleranceRange.value;
        });
        toleranceRange?.addEventListener('change', () => {
            const cur = prefs.get();
            const next = { ...cur, tol: parseInt(toleranceRange.value, 10) || 0 };
            prefs.set(next);
        });
    })();

    // --- Normalizacja i porównanie (zależne od preferencji) ---
    function canon(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\p{L}\p{N}\s]/gu, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    function editDistance(a, b) {
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
                    dp[j] + 1,
                    dp[j - 1] + 1,
                    prev + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
                prev = temp;
            }
        }
        return dp[n];
    }
    function isCorrectAnswer(user, expected) {
        const variants = String(expected || '')
            .split('|')
            .map(v => v.trim())
            .filter(Boolean);
        if (variants.length === 0) return false;

        const p = prefs.get();
        const useLenient = !!p.lenient;
        const tol = Math.max(0, Math.min(3, parseInt(p.tol, 10) || 0));

        const u = canon(user);
        // Jeśli łagodne porównanie wyłączone: wymagamy dokładnego dopasowania po kanonizacji
        if (!useLenient) {
            return variants.some(v => u === canon(v));
        }
        // Jeśli włączone: dopuszczamy dystans Levenshteina <= tol (0..3) po kanonizacji
        return variants.some(v => {
            const e = canon(v);
            if (u === e) return true;
            return editDistance(u, e) <= tol;
        });
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

    /* ---------- Import / Export (wspólny format) ---------- */
    const EXPORT_SCHEMA = 'leitner-srs@1';

    function tsISO(d = new Date()) { return d.toISOString(); }

    function downloadBlob(filename, dataStr) {
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; document.body.appendChild(a);
        a.click();
        a.remove(); URL.revokeObjectURL(url);
    }
    function sanitizeCards(arr) {
        return (Array.isArray(arr) ? arr : [])
            .filter(x => x && typeof x.term === 'string' && typeof x.meaning === 'string')
            .map(x => ({
                term: String(x.term), meaning: String(x.meaning),
                box: Math.min(5, Math.max(1, parseInt(x.box, 10) || 1)),
                dueAt: Number.isFinite(+x.dueAt) ? parseInt(x.dueAt, 10) : Date.now()
            }));
    }
    function exportSRS(datasetName = 'Zestaw SRS') {
        const payload = {
            schema: EXPORT_SCHEMA,
            meta: { datasetName, exportedAt: tsISO() },
            cards: readAll()
        };
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        downloadBlob(`srs-export-${stamp}.json`, JSON.stringify(payload, null, 2));
    }

    // === MERGE przy imporcie: duplikaty po term|meaning -> box=max, dueAt=min ===
    async function importSRSFile(file) {
        if (!file) return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            if (json?.schema !== EXPORT_SCHEMA) { alert('Nieprawidłowy plik (schema).'); return; }

            const incoming = sanitizeCards(json.cards);
            if (incoming.length === 0) { alert('Brak kart do importu.'); return; }

            const existing = readAll();
            const map = new Map(existing.map(c => [keyOf(c), c]));

            let added = 0, updated = 0;
            for (const inc of incoming) {
                const k = keyOf(inc);
                if (map.has(k)) {
                    const ex = map.get(k);
                    const merged = {
                        term: ex.term, meaning: ex.meaning,
                        box: Math.max(ex.box || 1, inc.box || 1),
                        dueAt: Math.min(
                            Number.isFinite(+ex.dueAt) ? +ex.dueAt : Date.now(),
                            Number.isFinite(+inc.dueAt) ? +inc.dueAt : Date.now()
                        )
                    };
                    map.set(k, merged);
                    updated++;
                } else {
                    map.set(k, inc);
                    added++;
                }
            }

            const mergedArr = Array.from(map.values());
            storage.set(mergedArr);
            updateReviewBadge();

            alert(
                `Import zakończony.\n` +
                `Zestaw: ${json?.meta?.datasetName || 'bez nazwy'}\n` +
                `Wczytano: ${incoming.length}\n` +
                `Dodano nowych: ${added}\n` +
                `Zaktualizowano istniejące: ${updated}\n` +
                `Razem w pamięci: ${mergedArr.length}`
            );
        } catch (err) {
            console.error(err); alert('Import nieudany (czy to poprawny JSON?).');
        } finally { if (importFile) importFile.value = ''; }
    }

    if (exportBtn) exportBtn.addEventListener('click', () => {
        const name = prompt('Nazwa zestawu do zapisania:', 'Mój zestaw');
        exportSRS(name || 'Mój zestaw');
    });
    if (importBtn) importBtn.addEventListener('click', () => importFile?.click());
    if (importFile) importFile.addEventListener('change', (e) => importSRSFile(e.target.files?.[0]));

    /* -------------- stan gry -------------- */
    const MAX_SESSION_CARDS = 15; // limit istnieje, ale tutaj nie blokujemy
    let deck = [];        // [{ term, meaning, failedBefore }]
    let queue = [];
    let current = null;
    let answered = false;
    let wasCorrect = null;
    let firstTryCount = 0;
    let totalCards = 0;

    // tryby: 'srs' | 'oneoff' | 'review'
    let sessionMode = 'srs';

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function parseInput(text) {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const pairs = []; const errors = [];
        lines.forEach((line, idx) => {
            const parts = line.split(';');
            if (parts.length < 2) { errors.push(idx + 1); return; }
            const term = parts[0].trim();
            const meaning = parts.slice(1).join(';').trim();
            if (!term || !meaning) { errors.push(idx + 1); return; }
            pairs.push({ term, meaning });
        });
        return { pairs, errors };
    }

    function show(view) {
        document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.style.display = 'none'; });
        view.classList.add('active'); view.style.display = 'block';
    }

    function updateProgress() {
        const remaining = queue.length + (current ? 1 : 0);
        const modeHint = sessionMode === 'oneoff' ? '• Tryb: jednorazowy' :
            sessionMode === 'review' ? '• Tryb: powtórka' : '• Tryb: z pamięcią';
        progressEl.textContent = `Pozostało: ${remaining} • Za 1. razem: ${firstTryCount} ${modeHint}`;
    }

    function loadCard(card) {
        current = card || null;
        if (!current) { finish(); return; }
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

    function nextCard() {
        if (queue.length === 0) { loadCard(null); return; }
        const n = queue.shift();
        loadCard(n);
    }

    function finish() {
        gameArea.classList.add('hidden');
        finishArea.classList.remove('hidden');
        const pct = totalCards ? Math.round((firstTryCount / totalCards) * 100) : 0;
        const lead = finishArea.querySelector('.lead');
        if (lead) lead.textContent = `Wszystkie fiszki zaliczone. Trafienia za 1. razem: ${firstTryCount}/${totalCards} (${pct}%).`;
        updateReviewBadge();
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function startWithPairs(pairs, mode) {
        sessionMode = mode;
        deck = shuffle(pairs.map(p => ({ ...p, failedBefore: false })));
        queue = deck.slice();
        totalCards = deck.length;
        firstTryCount = 0;

        gameArea.classList.remove('hidden');
        finishArea.classList.add('hidden');

        show(gameView);
        nextCard();
    }

    function startGameFromText(text, mode) {
        const { pairs, errors } = parseInput(text);
        if (errors.length) {
            setupError.classList.remove('hidden');
            setupError.textContent = `Błąd w wierszach bez poprawnego separatora ';': ${errors.join(', ')}.`;
            return;
        }
        if (pairs.length === 0) {
            setupError.classList.remove('hidden');
            setupError.textContent = 'Dodaj przynajmniej jedną parę.';
            return;
        }
        setupError.classList.add('hidden');
        startWithPairs(pairs, mode);
    }

    function startReviewMode() {
        const due = getDueNow();
        if (due.length === 0) {
            setupError.classList.remove('hidden');
            setupError.textContent = 'Brak kart „na dziś” w SRS.';
            return;
        }
        setupError.classList.add('hidden');
        startWithPairs(due.map(({ term, meaning }) => ({ term, meaning })), 'review');
    }

    // submit odpowiedzi
    answerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!current || answered) return;

        const userAns = answerInput.value;
        const ok = isCorrectAnswer(userAns, current.meaning);
        wasCorrect = ok;
        answered = true;

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
    nextBtn.addEventListener('click', () => {
        nextBtn.classList.add('hidden');
        nextCard();
    });

    // skróty klawiaturowe
    document.addEventListener('keydown', (e) => {
        if (!gameView.classList.contains('active')) return;
        if (e.code === 'Escape') { e.preventDefault(); backBtn.click(); return; }
        if (e.code === 'Enter') {
            if (document.activeElement !== answerInput && !answered) {
                e.preventDefault();
                answerForm.requestSubmit();
            } else if (answered) {
                e.preventDefault();
                nextBtn.click();
            }
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

    againBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        deck.forEach(c => c.failedBefore = false);
        queue = shuffle(deck.slice());
        firstTryCount = 0;
        gameArea.classList.remove('hidden');
        finishArea.classList.add('hidden');
        nextCard();
    });

    restartBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        show(setupView);
        updateReviewBadge();
    });

    updateReviewBadge();
});
