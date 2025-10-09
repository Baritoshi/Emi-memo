document.addEventListener('DOMContentLoaded', () => {
  const byId = (id) => document.getElementById(id);

  const setupView   = byId('setupView');
  const gameView    = byId('gameView');
  const input       = byId('inputPairs');
  const setupError  = byId('setupError');
  const sampleBtn   = byId('sampleBtn');
  const startBtn    = byId('startBtn');

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

  // --- STAN GRY ---
  let deck = [];          // [{ term, meaning, failedBefore }]
  let queue = [];         // kolejka do odpytywania
  let current = null;     // aktualna karta
  let revealed = false;   // czy odsłonięta?
  let firstTryCount = 0;  // ILE „UMIEM” ZA PIERWSZYM RAZEM
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
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    view.classList.add('active');
  }

  function updateProgress(){
    const remaining = queue.length + (current ? 1 : 0);
    progressEl.textContent = `Pozostało: ${remaining} • Za pierwszym razem: ${firstTryCount}`;
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
    setRevealed(false);   // start od słówka
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
    // pokaż krótkie podsumowanie w tekście pod nagłówkiem
    const lead = finishArea.querySelector('.lead');
    if (lead) lead.textContent = `Wszystkie fiszki zaliczone. Trafienia za 1. razem: ${firstTryCount}/${totalCards}.`;
    updateProgress();
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

    // zainicjalizuj talię wraz z flagą „czy wcześniej była pomyłka”
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

  // Zdarzenia (bez <form>, więc żadnego submitu)
  startBtn.addEventListener('click', () => startGameFromText(input?.value ?? ''));

  // Ctrl+Enter startuje grę z pola textarea
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

  backBtn.addEventListener('click', ()=> show(setupView));
  againBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    // reset licznika i flag first-try
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
    // zalicz jako „za 1. razem”, jeśli wcześniej nie kliknięto „Nie umiem”
    if (!current.failedBefore) firstTryCount++;
    nextCard();
  });

  dontKnowBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(!revealed) return;
    // oznacz, że na tej karcie był błąd — nie będzie liczona jako first-try
    current.failedBefore = true;
    queue.push(current);
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
});

