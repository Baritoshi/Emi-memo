// word-order/app.js — click-only (bank → koniec odpowiedzi; odpowiedź → powrót do banku)

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    // Views
    const setupView = $('setupView');
    const gameView = $('gameView');
    const finishView = $('finishView');

    // Setup controls
    const sentencesInput = $('sentencesInput');
    const sampleBtn = $('sampleBtn');
    const startBtn = $('startBtn');

    // Game controls
    const bankEl = $('bank');     // pula słów
    const answerEl = $('answer');   // układane zdanie
    const hintBox = $('hintBox');
    const progressEl = $('progress');
    const checkBtn = $('checkBtn');
    const showBtn = $('showBtn');
    const nextBtn = $('nextBtn');
    const restartBtn = $('restartBtn');

    // Finish
    const summaryText = $('summaryText');
    const againBtn = $('againBtn');

    // State
    const LIMIT = 15; // max zdań na sesję
    let deck = [];        // [{text, hint, tokens}]
    let order = [];       // kolejność indeksów w deck
    let ptr = 0;          // wskaźnik w order
    let current = null;   // bieżący obiekt
    let firstTry = true;  // czy to zdanie zaliczone za 1. razem
    let firstTryCount = 0;

    /* ---------- helpers ---------- */

    function show(view) {
        [setupView, gameView, finishView].forEach(v => v.classList.remove('active'));
        view.classList.add('active');
    }

    function sampleFill() {
        sentencesInput.value =
            `It's raining cats and dogs.
She has been learning English for three years.
We will meet tomorrow.; podpowiedź: spotkanie jutro
How many apples did you buy?
I’ll call you when I arrive.`;
    }

    // Słowa + interpunkcja jako osobne tokeny (obsługa PL znaków)
    function tokenize(sentence) {
        return sentence.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) || [];
    }

    // Składanie z poprawnymi spacjami przy interpunkcji
    function joinTokens(tokens) {
        const noSpaceBefore = /^[,.;!?):\]\}%»”]$/u;
        const noSpaceAfter = /^[(\[{%«„"]$/u;

        let out = '';
        tokens.forEach((t, i) => {
            if (i === 0) { out += t; return; }
            const prev = tokens[i - 1];
            if (noSpaceBefore.test(t)) out += t;
            else if (noSpaceAfter.test(prev)) out += t;
            else out += ' ' + t;
        });
        return out;
    }

    function normalizeSpaces(s) {
        return s.replace(/\s+/g, ' ').trim();
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function parseInput(text) {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const items = [];
        for (const line of lines.slice(0, LIMIT)) {
            const [rawText, ...hintRest] = line.split(';');
            const textPart = rawText?.trim();
            const hint = hintRest.join(';').trim();
            if (!textPart) continue;
            items.push({ text: textPart, hint: hint || '' });
        }
        return items;
    }

    function renderProgress() {
        const left = order.length - ptr;
        progressEl.textContent = `Pozostało: ${left} • Za 1. razem: ${firstTryCount}/${order.length}`;
    }

    // ——— CHIP jako PRZYCISK ———
    function makeChip(token) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'chip-btn';
        el.textContent = token;
        el.tabIndex = 0;

        function togglePlacement() {
            // jeśli chip jest w banku → dodaj NA KOŃCU odpowiedzi
            if (el.parentElement === bankEl) {
                answerEl.appendChild(el);
            } else {
                // jeśli chip jest w odpowiedzi → odeślij do banku
                bankEl.appendChild(el);
            }
        }

        // Klik myszką
        el.addEventListener('click', togglePlacement);
        // Enter/Space na fokusie
        el.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                togglePlacement();
            }
        });

        return el;
    }

    function loadSentence(item) {
        current = item;
        firstTry = true;

        // podpowiedź (jeśli była)
        hintBox.textContent = item.hint ? `Podpowiedź: ${item.hint}` : '';

        const toks = tokenize(item.text);
        const shuffled = shuffle([...toks]);

        bankEl.innerHTML = '';
        answerEl.innerHTML = '';
        bankEl.classList.remove('ok', 'bad');
        answerEl.classList.remove('ok', 'bad');

        shuffled.forEach(t => bankEl.appendChild(makeChip(t)));

        renderProgress();
        checkBtn.disabled = false;
        nextBtn.disabled = true;
    }

    /* ---------- flow ---------- */

    function startGame() {
        const items = parseInput(sentencesInput.value);
        if (items.length === 0) {
            alert('Dodaj przynajmniej jedno zdanie.');
            return;
        }
        deck = items.map(x => ({ ...x, tokens: tokenize(x.text) }));
        order = shuffle([...deck.keys()]);
        ptr = 0;
        firstTryCount = 0;

        show(gameView);
        loadSentence(deck[order[ptr]]);
    }

    function checkAnswer() {
        const placed = Array.from(answerEl.querySelectorAll('.chip-btn')).map(ch => ch.textContent);
        const candidate = normalizeSpaces(joinTokens(placed));
        const expected = normalizeSpaces(current.text);

        // reset klas sygnałowych
        answerEl.classList.remove('ok', 'bad');

        if (candidate === expected) {
            if (firstTry) firstTryCount++;
            checkBtn.disabled = true;
            nextBtn.disabled = false;
            answerEl.classList.add('ok');
            setTimeout(() => answerEl.classList.remove('ok'), 700);
        } else {
            firstTry = false;
            answerEl.classList.add('bad');
            setTimeout(() => answerEl.classList.remove('bad'), 350);
        }
    }

    function showSolution() {
        bankEl.innerHTML = '';
        answerEl.innerHTML = '';
        current.tokens.forEach(t => answerEl.appendChild(makeChip(t)));
        checkBtn.disabled = true;
        nextBtn.disabled = false;
        firstTry = false;
    }

    function nextSentence() {
        ptr++;
        if (ptr >= order.length) {
            finish();
            return;
        }
        loadSentence(deck[order[ptr]]);
    }

    function finish() {
        const pct = Math.round((firstTryCount / order.length) * 100);
        summaryText.textContent = `Za 1. razem: ${firstTryCount}/${order.length} (${pct}%).`;
        show(finishView);
    }

    function restart() {
        show(setupView);
    }

    /* ---------- bind ---------- */

    sampleBtn.addEventListener('click', sampleFill);
    startBtn.addEventListener('click', startGame);
    checkBtn.addEventListener('click', checkAnswer);
    showBtn.addEventListener('click', showSolution);
    nextBtn.addEventListener('click', nextSentence);
    restartBtn.addEventListener('click', restart);

    againBtn.addEventListener('click', () => {
        order = shuffle([...deck.keys()]);
        ptr = 0;
        firstTryCount = 0;
        show(gameView);
        loadSentence(deck[order[ptr]]);
    });

    // Skrót klawiatury: Enter = sprawdź / następne
    document.addEventListener('keydown', (e) => {
        if (!gameView.classList.contains('active')) return;
        if (e.key === 'Enter') {
            if (!checkBtn.disabled) checkAnswer();
            else if (!nextBtn.disabled) nextSentence();
        }
    });

    // demo
    sampleFill();
});
