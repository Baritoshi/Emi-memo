document.addEventListener('DOMContentLoaded', () => {
    const byId = (id) => document.getElementById(id);

    // Views
    const setupView = byId('setupView');
    const gameView = byId('gameView');
    const srsView = byId('srsView');

    // Setup
    const input = byId('inputPairs');
    const setupError = byId('setupError');
    const sampleBtn = byId('sampleBtn');
    const startBtn = byId('startBtn');
    const oneOffBtn = byId('oneOffBtn');
    const reviewBtn = byId('reviewBtn');
    const clearReviewBtn = byId('clearReviewBtn');
    const srsDetailsBtn = byId('srsDetailsBtn');

    // Losowanie (moduł)
    const shuffleToggle = byId('shuffleToggle');
    const sampleCountEl = byId('sampleCount');

    // Import/Export
    const exportBtn = byId('exportBtn');
    const importBtn = byId('importBtn');
    const importFile = byId('importFile');

    // SRS summary + details
    const srsCountEl = byId('srsCount');
    const srsDueEl = byId('srsDue');
    const srsCount2 = byId('srsCount2');
    const srsDue2 = byId('srsDue2');
    const srsBackBtn = byId('srsBackBtn');
    const srsTable = byId('srsTable');

    // Game
    const progressEl = byId('progress');
    const backBtn = byId('backBtn');
    const gameArea = byId('gameArea');
    const finishArea = byId('finishArea');
    const againBtn = byId('againBtn');
    const restartBtn = byId('restartBtn');

    const flashcard = byId('flashcard');
    const card3d = byId('card3d');
    const frontText = byId('frontText');
    const backText = byId('backText');
    const actions = byId('actions');
    const knowBtn = byId('knowBtn');
    const dontKnowBtn = byId('dontKnowBtn');

    // Stats
    const finishLead = byId('finishLead');
    const statFirstTry = byId('statFirstTry');
    const statTotal = byId('statTotal');
    const statPercent = byId('statPercent');
    const statDuration = byId('statDuration');
    const statTotalAttempts = byId('statTotalAttempts');
    const statAvgAttempts = byId('statAvgAttempts');

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
    const norm = s => (s || '').trim().toLowerCase();
    const keyOf = c => `${norm(c.term)}|${norm(c.meaning)}`;
    const readAll = () => storage.get();
    const writeAll = a => { storage.set(a); updateReviewBadge(); refreshSrsSummary(); };
    const dueNowCount = () => { const now = Date.now(); return readAll().filter(e => (e.dueAt ?? 0) <= now).length; };
    const getDueNow = () => { const now = Date.now(); return readAll().filter(e => (e.dueAt ?? 0) <= now); };
    const findIndex = (arr, c) => arr.findIndex(x => keyOf(x) === keyOf(c));
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
    function refreshSrsSummary() {
        if (srsCountEl) srsCountEl.textContent = String(readAll().length);
        if (srsDueEl) srsDueEl.textContent = String(dueNowCount());
    }

    /* ---------- Import/Export ---------- */
    const EXPORT_SCHEMA = 'leitner-srs@1';
    const tsISO = (d = new Date()) => d.toISOString();
    function downloadBlob(filename, data) {
        const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }
    function sanitizeCards(arr) {
        return (Array.isArray(arr) ? arr : []).filter(x => x && typeof x.term === 'string' && typeof x.meaning === 'string')
            .map(x => ({
                term: String(x.term), meaning: String(x.meaning), box: Math.min(5, Math.max(1, parseInt(x.box, 10) || 1)),
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
            const cards = sanitizeCards(json.cards); if (cards.length === 0) { alert('Brak kart do importu.'); return; }
            storage.set(cards); updateReviewBadge(); refreshSrsSummary();
            alert(`Zaimportowano ${cards.length} kart z zestawu: "${json?.meta?.datasetName || 'bez nazwy'}".`);
        } catch (e) { console.error(e); alert('Import nieudany.'); }
        finally { if (importFile) importFile.value = ''; }
    }
    exportBtn?.addEventListener('click', () => { const n = prompt('Nazwa zestawu:', 'Mój zestaw'); exportSRS(n || 'Mój zestaw'); });
    importBtn?.addEventListener('click', () => importFile?.click());
    importFile?.addEventListener('change', (e) => importSRSFile(e.target.files?.[0]));

    /* ---------- Losowanie ---------- */
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

    // Sesja
    let deck = [], queue = [], current = null, revealed = false;
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
    function show(view) {
        document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.style.display = 'none'; });
        view.classList.add('active'); view.style.display = 'block';
    }
    function updateProgress() {
        const remaining = queue.length + (current ? 1 : 0);
        const modeHint = sessionMode === 'oneoff' ? '• Tryb: jednorazowy' : sessionMode === 'review' ? '• Tryb: powtórka' : '• Tryb: z pamięcią';
        progressEl.textContent = `Pozostało: ${remaining} • Za 1. razem: ${firstTryCount} ${modeHint}`;
    }
    function setRevealed(v) { revealed = v; card3d.classList.toggle('revealed', v); actions.classList.toggle('hidden', !v); }
    function loadCard(card) {
        current = card || null; if (!current) { finish(); return; }
        frontText.textContent = current.term; backText.textContent = current.meaning;
        setRevealed(false); updateProgress();
    }
    function nextCard() { if (queue.length === 0) { loadCard(null); return; } loadCard(queue.shift()); }
    function fmtDuration(ms) { const s = Math.max(0, Math.floor(ms / 1000)); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; }
    function finish() {
        const durationMs = Date.now() - sessionStart;
        gameArea.classList.add('hidden'); finishArea.classList.remove('hidden');
        const pct = totalCards ? Math.round((firstTryCount / totalCards) * 100) : 0;
        const avg = totalCards ? (totalAttempts / totalCards) : 0;
        finishLead.textContent = `Wszystkie fiszki zaliczone. Trafienia za 1. razem: ${firstTryCount}/${totalCards} (${pct}%).`;
        byId('statFirstTry').textContent = String(firstTryCount);
        byId('statTotal').textContent = String(totalCards);
        byId('statPercent').textContent = `${pct}%`;
        byId('statDuration').textContent = fmtDuration(durationMs);
        byId('statTotalAttempts').textContent = String(totalAttempts);
        byId('statAvgAttempts').textContent = avg.toFixed(2);
        updateReviewBadge(); refreshSrsSummary();
    }

    function showLimitMessage(pairs) {
        const over = pairs.length - MAX_SESSION_CARDS;
        const extra = pairs.slice(MAX_SESSION_CARDS, MAX_SESSION_CARDS + 10)
            .map(p => `&bull; ${escapeHtml(p.term)} — ${escapeHtml(p.meaning)}`).join('<br>');
        setupError.classList.remove('hidden');
        setupError.innerHTML = `Masz ${pairs.length} par, a limit jednej sesji to ${MAX_SESSION_CARDS}. Usuń ${over} i spróbuj ponownie.` +
            (extra ? `<br><br>Nadmiar (pierwsze 10):<br>${extra}` : '');
    }

    function prepareDeck(allPairs) {
        let pairs = allPairs.slice();
        if (pairs.length === 0) return [];

        const nRaw = sampleCountEl?.value?.trim();
        const n = nRaw ? Math.min(MAX_SESSION_CARDS, Math.max(1, parseInt(nRaw, 10) || 1)) : null;

        if (shuffleToggle?.checked) { shuffle(pairs); }
        if (n) { pairs = sampleArray(pairs, n); }

        if (pairs.length > MAX_SESSION_CARDS) {
            showLimitMessage(pairs);
            return [];
        }
        return pairs;
    }

    function startWithPairs(pairs, mode) {
        const prepared = prepareDeck(pairs);
        if (prepared.length === 0) { return; }

        sessionMode = mode;
        deck = prepared.map(p => ({ ...p, failedBefore: false, attempts: 0 }));
        queue = deck.slice();
        totalCards = deck.length;
        firstTryCount = 0; totalAttempts = 0; sessionStart = Date.now();

        gameArea.classList.remove('hidden'); finishArea.classList.add('hidden');
        show(gameView); nextCard(); flashcard?.focus();
    }

    function startGameFromText(text, mode) {
        const { pairs, errors } = parseInput(text);
        if (errors.length) { setupError.classList.remove('hidden'); setupError.textContent = `Błąd w wierszach: ${errors.join(', ')}`; return; }
        if (pairs.length === 0) { setupError.classList.remove('hidden'); setupError.textContent = 'Dodaj przynajmniej jedną parę.'; return; }
        setupError.classList.add('hidden');
        startWithPairs(pairs, mode);
    }

    function startReviewMode() {
        const due = getDueNow(); if (due.length === 0) { setupError.classList.remove('hidden'); setupError.textContent = 'Brak kart „na dziś” w SRS.'; return; }
        const pairs = due.map(({ term, meaning }) => ({ term, meaning }));
        setupError.classList.add('hidden');
        startWithPairs(pairs, 'review');
    }

    /* ---- SRS details ---- */
    function escapeHtmlCell(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function fmtDate(ts) { if (!ts) return '—'; const d = new Date(ts); return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    function buildSrsTable() {
        const data = readAll().slice().sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0));
        const tbody = srsTable.querySelector('tbody'); tbody.innerHTML = '';
        for (const e of data) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHtmlCell(e.term)}</td><td>${escapeHtmlCell(e.meaning)}</td><td>${e.box ?? 1}</td><td>${fmtDate(e.dueAt)}</td>`;
            tbody.appendChild(tr);
        }
        if (srsCount2) srsCount2.textContent = String(data.length);
        if (srsDue2) srsDue2.textContent = String(dueNowCount());
    }

    /* ---- Interakcje gry ---- */
    function updateProgress() {
        const remaining = queue.length + (current ? 1 : 0);
        const modeHint = sessionMode === 'oneoff' ? '• Tryb: jednorazowy' : sessionMode === 'review' ? '• Tryb: powtórka' : '• Tryb: z pamięcią';
        progressEl.textContent = `Pozostało: ${remaining} • Za 1. razem: ${firstTryCount} ${modeHint}`;
    }

    startBtn?.addEventListener('click', () => startGameFromText(input?.value ?? '', 'srs'));
    oneOffBtn?.addEventListener('click', () => startGameFromText(input?.value ?? '', 'oneoff'));
    reviewBtn?.addEventListener('click', startReviewMode);
    clearReviewBtn?.addEventListener('click', () => { storage.clear(); updateReviewBadge(); refreshSrsSummary(); });

    srsDetailsBtn?.addEventListener('click', () => { buildSrsTable(); show(srsView); });
    srsBackBtn?.addEventListener('click', () => { show(setupView); refreshSrsSummary(); });

    sampleBtn?.addEventListener('click', () => {
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

    backBtn?.addEventListener('click', () => { show(setupView); updateReviewBadge(); refreshSrsSummary(); });

    function setRevealed(v) { revealed = v; card3d.classList.toggle('revealed', v); actions.classList.toggle('hidden', !v); }
    flashcard?.addEventListener('click', () => { if (current) setRevealed(true); });
    actions?.addEventListener('click', (e) => e.stopPropagation());

    knowBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); if (!revealed) return;
        current.attempts = (current.attempts || 0) + 1; totalAttempts++;
        if (!current.failedBefore) firstTryCount++;
        if (sessionMode !== 'oneoff') promote(current);
        nextCard();
    });
    dontKnowBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); if (!revealed) return;
        current.attempts = (current.attempts || 0) + 1; totalAttempts++;
        current.failedBefore = true; queue.push(current);
        if (sessionMode !== 'oneoff') demote(current);
        nextCard();
    });

    document.addEventListener('keydown', (e) => {
        if (!gameView.classList.contains('active')) return;
        if (!current && e.code !== 'Escape') return;
        if (e.code === 'Space') { e.preventDefault(); setRevealed(true); }
        if (e.code === 'KeyJ') { e.preventDefault(); if (revealed) knowBtn.click(); }
        if (e.code === 'KeyF') { e.preventDefault(); if (revealed) dontKnowBtn.click(); }
        if (e.code === 'Escape') { e.preventDefault(); backBtn.click(); }
    });

    // --- helpery resetu (DODANE) ---
    function resetFinishAndShowGame() {
        gameArea.classList.remove('hidden');
        finishArea.classList.add('hidden');
    }
    function resetDeckStatsForReplay() {
        deck.forEach(c => { c.failedBefore = false; c.attempts = 0; });
        queue = deck.slice();
        firstTryCount = 0;
        totalAttempts = 0;
        sessionStart = Date.now();
    }

    // Zagraj ponownie — ta sama talia od początku
    againBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        resetDeckStatsForReplay();
        resetFinishAndShowGame();
        setRevealed(false);
        nextCard();
    });

    // Nowa talia — powrót do startu
    restartBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        show(setupView);
        setupError?.classList.add('hidden');
        updateReviewBadge();
        refreshSrsSummary();
    });

    updateReviewBadge(); refreshSrsSummary();
});
