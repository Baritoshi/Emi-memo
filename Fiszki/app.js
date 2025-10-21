// Fiszki — app.js z MERGE importem + statystyki sesji
document.addEventListener('DOMContentLoaded', () => {
    const byId = (id) => document.getElementById(id);

    // Views
    const setupView = byId('setupView');
    const gameView = byId('gameView');
    const srsView = byId('srsView');

    // Setup controls
    const input = byId('inputPairs');
    const setupError = byId('setupError');
    const sampleBtn = byId('sampleBtn');
    const startBtn = byId('startBtn');     // start z SRS
    const oneOffBtn = byId('oneOffBtn');    // sesja jednorazowa
    const reviewBtn = byId('reviewBtn');    // karty „na dziś”
    const clearReviewBtn = byId('clearReviewBtn');
    const srsDetailsBtn = byId('srsDetailsBtn');

    // Import/Export controls
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

    // Game controls
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

    // Stats UI (nowe)
    const finishLead = byId('finishLead');
    const statFirstTry = byId('statFirstTry');
    const statTotal = byId('statTotal');
    const statPercent = byId('statPercent');
    const statDuration = byId('statDuration');
    const statTotalAttempts = byId('statTotalAttempts');
    const statAvgAttempts = byId('statAvgAttempts');

    /* ---------- SRS Leitner (5 pudełek, dni: 1,2,4,8,16) ---------- */
    const STORAGE_KEY = 'flash_srs_v1';          // wspólna pamięć dla obu gier
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
        clear() { localStorage.removeItem(STORAGE_KEY); }
    };

    // Normalizacja / klucze
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
        if (srsDueEl) srsDueEl.textContent = String(due);
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
                term: String(x.term),
                meaning: String(x.meaning),
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

    // MERGE przy imporcie: duplikaty po term|meaning -> box=max, dueAt=min
    async function importSRSFile(file) {
        if (!file) return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            if (json?.schema !== EXPORT_SCHEMA) {
                alert('Nieprawidłowy plik (schema).'); return;
            }

            const incoming = sanitizeCards(json.cards);
            if (incoming.length === 0) {
                alert('Brak kart do importu.'); return;
            }

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
            refreshSrsSummary();

            alert(
                `Import zakończony.\n` +
                `Zestaw: ${json?.meta?.datasetName || 'bez nazwy'}\n` +
                `Wczytano: ${incoming.length}\n` +
                `Dodano nowych: ${added}\n` +
                `Zaktualizowano istniejące: ${updated}\n` +
                `Razem w pamięci: ${mergedArr.length}`
            );
        } catch (err) {
            console.error(err);
            alert('Import nieudany (czy to poprawny JSON?).');
        } finally {
            if (importFile) importFile.value = '';
        }
    }

    exportBtn?.addEventListener('click', () => {
        const name = prompt('Nazwa zestawu do zapisania:', 'Mój zestaw');
        exportSRS(name || 'Mój zestaw');
    });
    importBtn?.addEventListener('click', () => importFile?.click());
    importFile?.addEventListener('change', (e) => importSRSFile(e.target.files?.[0]));

    /* -------------- stan gry + statystyki -------------- */
    const MAX_SESSION_CARDS = 15; // LIMIT 15 na sesję
    let deck = [];          // [{ term, meaning, failedBefore, attempts }]
    let queue = [];
    let current = null;
    let revealed = false;
    let firstTryCount = 0;
    let totalCards = 0;

    // statystyki sesji
    let sessionStart = 0;
    let totalAttempts = 0; // każde kliknięcie Umiem/Nie umiem

    // tryb sesji: 'srs' | 'oneoff' | 'review'
    let sessionMode = 'srs';

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
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

    function setRevealed(v) {
        revealed = v;
        card3d.classList.toggle('revealed', revealed);
        actions.classList.toggle('hidden', !revealed);
    }

    function loadCard(card) {
        current = card || null;
        if (!current) { finish(); return; }
        frontText.textContent = current.term;
        backText.textContent = current.meaning;
        setRevealed(false);
        updateProgress();
    }

    function nextCard() {
        if (queue.length === 0) { loadCard(null); return; }
        const n = queue.shift();
        loadCard(n);
    }

    function fmtDuration(ms) {
        const s = Math.max(0, Math.floor(ms / 1000));
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    function finish() {
        const durationMs = Date.now() - sessionStart;

        gameArea.classList.add('hidden');
        finishArea.classList.remove('hidden');

        const pct = totalCards ? Math.round((firstTryCount / totalCards) * 100) : 0;
        const avgAttempts = totalCards ? (totalAttempts / totalCards) : 0;

        if (finishLead) finishLead.textContent = `Wszystkie fiszki zaliczone. Trafienia za 1. razem: ${firstTryCount}/${totalCards} (${pct}%).`;
        if (statFirstTry) statFirstTry.textContent = String(firstTryCount);
        if (statTotal) statTotal.textContent = String(totalCards);
        if (statPercent) statPercent.textContent = `${pct}%`;
        if (statDuration) statDuration.textContent = fmtDuration(durationMs);
        if (statTotalAttempts) statTotalAttempts.textContent = String(totalAttempts);
        if (statAvgAttempts) statAvgAttempts.textContent = avgAttempts.toFixed(2);

        updateProgress();
        updateReviewBadge();
        refreshSrsSummary();
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function showLimitMessage(pairs) {
        const over = pairs.length - MAX_SESSION_CARDS;
        const extra = pairs.slice(MAX_SESSION_CARDS, MAX_SESSION_CARDS + 10)
            .map(p => `&bull; ${escapeHtml(p.term)} — ${escapeHtml(p.meaning)}`)
            .join('<br>');
        setupError.classList.remove('hidden');
        setupError.innerHTML =
            `Masz ${pairs.length} par, a limit jednej sesji to ${MAX_SESSION_CARDS}. Usuń ${over} pozycji i spróbuj ponownie.` +
            (extra ? `<br><br>Nadmiar (pierwsze 10):<br>${extra}` : '');
    }

    function startWithPairs(pairs, mode) {
        sessionMode = mode;

        deck = shuffle(pairs.map(p => ({ ...p, failedBefore: false, attempts: 0 })));
        queue = deck.slice();
        totalCards = deck.length;
        firstTryCount = 0;
        totalAttempts = 0;
        sessionStart = Date.now();

        gameArea.classList.remove('hidden');
        finishArea.classList.add('hidden');

        show(gameView);
        nextCard();
        flashcard?.focus();
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
            setupError.textContent = 'Dodaj przynajmniej jedną parę słówek.';
            return;
        }

        if (pairs.length > MAX_SESSION_CARDS) {
            showLimitMessage(pairs);
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
        const pairs = due.map(({ term, meaning }) => ({ term, meaning }));
        if (pairs.length > MAX_SESSION_CARDS) {
            showLimitMessage(pairs);
            return;
        }
        setupError.classList.add('hidden');
        startWithPairs(shuffle(pairs), 'review');
    }

    /* ---- SRS DETAILS (tabela) ---- */
    function escapeHtmlCell(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function fmtDate(ts) {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    function buildSrsTable() {
        const data = readAll().slice().sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0));
        const tbody = srsTable.querySelector('tbody');
        tbody.innerHTML = '';
        for (const e of data) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${escapeHtmlCell(e.term)}</td>
        <td>${escapeHtmlCell(e.meaning)}</td>
        <td>${e.box ?? 1}</td>
        <td>${fmtDate(e.dueAt)}</td>
      `;
            tbody.appendChild(tr);
        }
        if (srsCount2) srsCount2.textContent = String(data.length);
        if (srsDue2) srsDue2.textContent = String(dueNowCount());
    }

    /* -------------- zdarzenia -------------- */
    startBtn?.addEventListener('click', () => startGameFromText(input?.value ?? '', 'srs'));
    oneOffBtn?.addEventListener('click', () => startGameFromText(input?.value ?? '', 'oneoff'));
    reviewBtn?.addEventListener('click', startReviewMode);
    clearReviewBtn?.addEventListener('click', () => { storage.clear(); updateReviewBadge(); refreshSrsSummary(); });

    srsDetailsBtn?.addEventListener('click', () => { buildSrsTable(); show(srsView); });
    srsBackBtn?.addEventListener('click', () => { show(setupView); refreshSrsSummary(); });

    input?.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            startGameFromText(input.value, 'srs');
        }
    });

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

    againBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        firstTryCount = 0;
        totalAttempts = 0;
        sessionStart = Date.now();
        deck.forEach(c => { c.failedBefore = false; c.attempts = 0; });
        queue = shuffle(deck.slice()); // ponownie tasuj
        gameArea.classList.remove('hidden');
        finishArea.classList.add('hidden');
        nextCard();
    });

    restartBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        show(setupView); updateReviewBadge(); refreshSrsSummary();
    });

    flashcard?.addEventListener('click', () => { if (current) setRevealed(true); });
    actions?.addEventListener('click', (e) => e.stopPropagation());

    knowBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!revealed) return;

        // statystyki
        current.attempts = (current.attempts || 0) + 1;
        totalAttempts++;

        if (!current.failedBefore) firstTryCount++;
        if (sessionMode !== 'oneoff') promote(current);
        nextCard();
    });

    dontKnowBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!revealed) return;

        // statystyki
        current.attempts = (current.attempts || 0) + 1;
        totalAttempts++;

        current.failedBefore = true;
        queue.push(current);
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

    // Init summaries
    updateReviewBadge();
    refreshSrsSummary();
});
