let wordPairs = [];
let currentPlayer = 1;
let flippedCards = [];
let boardLocked = false;
let playerScores = [0, 0];

document.getElementById("word-form").addEventListener("submit", startGame);

function addPair() {
    const container = document.getElementById("pairs-input");
    container.innerHTML += '<input type="text" placeholder="English Word" required><input type="text" placeholder="Polish Word" required>';
}

function startGame(event) {
    event.preventDefault();
    const inputs = document.querySelectorAll("#pairs-input input");
    wordPairs = [];

    for (let i = 0; i < inputs.length; i += 2) {
        const engWord = inputs[i].value;
        const plWord = inputs[i + 1].value;
        wordPairs.push({ text: engWord, lang: 'EN' }, { text: plWord, lang: 'PL' });
    }

    shuffle(wordPairs);
    setupBoard();
    document.getElementById("word-form").style.display = "none";
    document.getElementById("game-container").style.display = "block";
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function setupBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = '';
    wordPairs.forEach((pair, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.index = index;
        card.dataset.text = pair.text;
        card.dataset.lang = pair.lang;
        card.innerHTML = '';
        card.addEventListener("click", () => flipCard(card));
        board.appendChild(card);
    });
}

function flipCard(card) {
    if (boardLocked || card.classList.contains("flipped")) return;

    card.classList.add("flipped");
    card.innerHTML = card.dataset.text;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.text === card2.dataset.text && card1.dataset.lang !== card2.dataset.lang;

    if (isMatch) {
        card1.removeEventListener("click", () => flipCard(card1));
        card2.removeEventListener("click", () => flipCard(card2));
        playerScores[currentPlayer - 1]++;
        updateTurnIndicator();
        flippedCards = [];

        if (playerScores.reduce((a, b) => a + b) === wordPairs.length / 2) {
            setTimeout(() => alert("Game Over!"), 500);
        }
    } else {
        boardLocked = true;
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            card1.innerHTML = '';
            card2.innerHTML = '';
            flippedCards = [];
            boardLocked = false;
            switchPlayer();
        }, 1000);
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateTurnIndicator();
}

function updateTurnIndicator() {
    document.getElementById("turn-indicator").textContent = `Player ${currentPlayer}'s Turn - Player 1: ${playerScores[0]}, Player 2: ${playerScores[1]}`;
}

function restartGame() {
    document.getElementById("word-form").reset();
    document.getElementById("pairs-input").innerHTML = '<input type="text" placeholder="English Word" required><input type="text" placeholder="Polish Word" required>';
    document.getElementById("word-form").style.display = "block";
    document.getElementById("game-container").style.display = "none";
    playerScores = [0, 0];
    currentPlayer = 1;
    updateTurnIndicator();
}