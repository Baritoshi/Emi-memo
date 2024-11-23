let players = [];         // Array to store player details (name and score)
let currentPlayerIndex = 0; // Index of the current player
let images = [];          // Array to store image URLs
let flippedCards = [];    // Array to store the currently flipped cards for comparison
let boardLocked = false;  // Boolean to lock the board during match checking

document.getElementById("player-config-form").addEventListener("submit", configurePlayers);
document.getElementById("generate-names").addEventListener("click", generatePlayerFields);
document.getElementById("image-form").addEventListener("submit", startGame);

// Function to generate input fields for player names
function generatePlayerFields() {
    const numPlayers = parseInt(document.getElementById("num-players").value);
    const playerNamesDiv = document.getElementById("player-names");
    playerNamesDiv.innerHTML = ''; // Clear existing fields

    for (let i = 1; i <= numPlayers; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Player ${i} Name`;
        input.required = true;
        input.id = `player-${i}`;
        playerNamesDiv.appendChild(input);
    }
}

// Function to configure players and start the image input phase
function configurePlayers(event) {
    event.preventDefault();

    players = []; // Reset players array
    const numPlayers = parseInt(document.getElementById("num-players").value);

    for (let i = 1; i <= numPlayers; i++) {
        const playerName = document.getElementById(`player-${i}`).value.trim();
        players.push({ name: playerName, score: 0 });
    }

    document.getElementById("player-config-form").style.display = "none"; // Hide the player config form
    document.getElementById("image-form").style.display = "block"; // Show the image input form
}

// Function to start the game
function startGame(event) {
    event.preventDefault();
    const inputText = document.getElementById("image-input").value.trim();
    const lines = inputText.split("\n");

    images = []; // Reset images array
    lines.forEach((line) => {
        const url = line.trim();
        if (url) {
            images.push({ id: url, src: url });
            images.push({ id: url, src: url });
        }
    });

    shuffle(images);
    setupBoard();
    document.getElementById("image-form").style.display = "none"; // Hide the image input form
    document.getElementById("game-container").style.display = "block"; // Show the game container
    updateScoreBoard();
}

// Function to shuffle the array of images
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Setup the game board based on shuffled images
function setupBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = '';
    images.forEach((image, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.index = index;
        card.dataset.id = image.id;

        const imgElement = document.createElement("img");
        imgElement.src = image.src;
        card.appendChild(imgElement);

        card.addEventListener("click", () => flipCard(card));
        board.appendChild(card);
    });
}

// Function to update the score board
function updateScoreBoard() {
    const scoreBoard = document.getElementById("score-board");
    scoreBoard.innerHTML = players.map((player, index) => {
        const currentPlayerClass = index === currentPlayerIndex ? 'current-player' : '';
        return `<div class="player-score ${currentPlayerClass}">${player.name}: ${player.score}</div>`;
    }).join('');
}

// Handle card flipping logic
function flipCard(card) {
    if (boardLocked || card.classList.contains("flipped")) return;

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

// Check if two flipped cards form a pair
function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.id === card2.dataset.id;

    if (isMatch) {
        players[currentPlayerIndex].score++;
        updateScoreBoard();

        setTimeout(() => {
            card1.style.visibility = "hidden";
            card2.style.visibility = "hidden";
            flippedCards = [];
            if (images.length / 2 === players.reduce((sum, player) => sum + player.score, 0)) {
                alert("Game Over! Scores:\n" + players.map(p => `${p.name}: ${p.score}`).join("\n"));
            }
        }, 500);
    } else {
        boardLocked = true;
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            flippedCards = [];
            boardLocked = false;
            nextPlayer();
        }, 1000);
    }
}

// Move to the next player
function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateScoreBoard();
}

// Restart the game
function restartGame() {
    document.getElementById("player-config-form").reset();
    document.getElementById("image-form").reset();
    document.getElementById("player-config-form").style.display = "block";
    document.getElementById("image-form").style.display = "none";
    document.getElementById("game-container").style.display = "none";
    players = [];
    currentPlayerIndex = 0;
}
