let wordPairs = [];
let players = [];
let currentPlayerIndex = 0;
let flippedCards = [];
let boardLocked = false;
let turnsTaken = 0; // Track the number of turns in single-player mode


document.getElementById("player-config").addEventListener("submit", configurePlayers);
document.getElementById("generate-players").addEventListener("click", generatePlayerFields);
document.getElementById("word-form").addEventListener("submit", startGame);

function generatePlayerFields() {
    const numPlayers = parseInt(document.getElementById("num-players").value, 10);
    const playerNamesDiv = document.getElementById("player-names");
    playerNamesDiv.innerHTML = '';

    for (let i = 1; i <= numPlayers; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Player ${i} Name`;
        input.required = true;
        input.id = `player-${i}`;
        playerNamesDiv.appendChild(input);
    }
}


function configurePlayers(event) {
    event.preventDefault();

    players = [];
    const numPlayers = parseInt(document.getElementById("num-players").value, 10);
    for (let i = 1; i <= numPlayers; i++) {
        const name = document.getElementById(`player-${i}`).value.trim();
        players.push({ name, score: 0 });
    }

    document.getElementById("player-config").style.display = "none";
    document.getElementById("word-form").style.display = "block";
}

function startGame(event) {
    event.preventDefault();

    const inputText = document.getElementById("word-input").value.trim();
    const lines = inputText.split("\n");

    wordPairs = [];
    lines.forEach((line, index) => {
        const [eng, pl] = line.split(",").map(word => word.trim());
        const pairId = `pair-${index}`;
        wordPairs.push(
            { id: pairId, text: eng, lang: "EN" },
            { id: pairId, text: pl, lang: "PL" }
        );
    });

    shuffle(wordPairs);
    setupBoard();

    document.getElementById("word-form").style.display = "none";
    document.getElementById("game-container").style.display = "block";

    updateScoreBoard(); // Initialize scoreboard and turn indicator
    updateTurnIndicator(); // Show the current player's turn
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
        card.dataset.pairId = pair.id;
        card.dataset.lang = pair.lang;
        card.innerHTML = '';
        card.addEventListener("click", () => flipCard(card));
        board.appendChild(card);
    });
}

// Update the scoreboard and turn indicator
function updateScoreBoard() {
    const scoreboard = document.getElementById("score-board");
    scoreboard.innerHTML = players.map((player, index) => {
        const currentPlayerClass = index === currentPlayerIndex ? "current-player" : "";
        return `<div class="player-score ${currentPlayerClass}">${player.name}: ${player.score}</div>`;
    }).join("");

    updateTurnIndicator(); // Update the turn indicator
}

// Update the current player's turn indicator
function updateTurnIndicator() {
    const turnIndicator = document.getElementById("turn-indicator");

    if (players.length === 1) {
        turnIndicator.textContent = `Turns Taken: ${turnsTaken}`;
    } else {
        turnIndicator.textContent = `Player's Turn: ${players[currentPlayerIndex].name}`;
    }
}


function flipCard(card) {
    if (boardLocked || card.classList.contains("flipped")) return;

    card.classList.add("flipped");
    card.innerHTML = wordPairs[card.dataset.index].text;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.pairId === card2.dataset.pairId) {
        players[currentPlayerIndex].score++;
        updateScoreBoard();

        setTimeout(() => {
            card1.style.visibility = "hidden";
            card2.style.visibility = "hidden";
            flippedCards = [];

            if (players.reduce((sum, p) => sum + p.score, 0) === wordPairs.length / 2) {
                if (players.length === 1) {
                    alert(`Game Over! You completed the game in ${turnsTaken} turns.`);
                } else {
                    const scores = players.map(p => `${p.name}: ${p.score}`).join("\n");
                    alert(`Game Over!\nScores:\n${scores}`);
                }
            }
        }, 500);
    } else {
        boardLocked = true;
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            card1.innerHTML = '';
            card2.innerHTML = '';
            flippedCards = [];
            boardLocked = false;
            nextPlayer();
        }, 1000);
    }
}


function nextPlayer() {
    if (players.length === 1) {
        // Single-player mode: Count the number of turns
        turnsTaken++;
        updateTurnIndicator(); // Update the turn indicator with the number of turns
    } else {
        // Multiplayer mode: Cycle to the next player
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnIndicator();
    }
}


function restartGame() {
    document.getElementById("player-config").reset();
    document.getElementById("word-form").reset();
    document.getElementById("player-config").style.display = "block";
    document.getElementById("word-form").style.display = "none";
    document.getElementById("game-container").style.display = "none";
    players = [];
    currentPlayerIndex = 0;
    turnsTaken = 0; // Reset turns taken
}

