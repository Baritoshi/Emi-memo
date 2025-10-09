const setupView = document.getElementById('setupView');
finishArea.classList.add('hidden');


show(gameView);
nextCard();
flashcard.focus();
}


// Event wiring
startBtn.addEventListener('click', ()=> startGameFromText(input.value));
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


backBtn.addEventListener('click', ()=>{
show(setupView);
});
againBtn.addEventListener('click', ()=>{
// play again with the same deck
queue = deck.slice();
gameArea.classList.remove('hidden');
finishArea.classList.add('hidden');
nextCard();
});
restartBtn.addEventListener('click', ()=>{
show(setupView);
});


flashcard.addEventListener('click', ()=>{
if(!current) return;
setFlipped(true);
});


knowBtn.addEventListener('click', ()=>{
if(!flipped) return; // only after reveal
// do not re-queue; proceed
nextCard();
});


dontKnowBtn.addEventListener('click', ()=>{
if(!flipped) return;
// push current to the end, then move on
if(current) queue.push(current);
nextCard();
});


// Keyboard shortcuts
document.addEventListener('keydown', (e)=>{
if(!gameView.classList.contains('active')) return;
if(!current && e.code!=='Escape') return;
if(e.code==='Space'){ e.preventDefault(); setFlipped(true); }
if(e.code==='KeyJ'){ e.preventDefault(); if(flipped) knowBtn.click(); }
if(e.code==='KeyF'){ e.preventDefault(); if(flipped) dontKnowBtn.click(); }
if(e.code==='Escape'){ e.preventDefault(); backBtn.click(); }
});