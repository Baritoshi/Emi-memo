let wordPairs = [];         // Array to store word pairs with unique IDs
let players = [];           // Array to store player data (name and score)
let currentPlayerIndex = 0; // Index of the current player
let flippedCards = [];      // Array to store the currently flipped cards for comparison
let boardLocked = false;    // Boolean to lock the board during match checking

// Event listener for the word form submission
document.getElementById("word-form").addEventListener("submit", configurePlayers);

// Function to configure players and move to the game setup
function configurePlayers(event) {
    event.preventDefault(); // Prevent default form submission

    // Get the number of players
    const numPlayers = parseInt(document.getElementById("num-players").value, 10);
    players = []; // Reset the players array

    // Collect player names and initialize scores
    for (let i = 0; i < numPlayers; i++) {
        const playerName = document.getElementById(`player-name-${i + 1}`).value.trim();
        players.push({ name: playerName, score: 0 });
    }

    // Show the game setup form and hide the player configuration form
    document.getElementById("player-config").style.display = "none";
    document.getElementById("word-setup").style.display = "block";
}

// Function to start the game, triggered on word form submission
function startGame(event) {
    event.preventDefault(); // Prevent default form submission
    const inputText = document.getElementById("word-input").value.trim(); // Get and trim the input
    const lines = inputText.split("\n"); // Split input into lines

    wordPairs = []; // Reset word pairs array

    // Parse each line to extract word pairs
    lines.forEach((line, index) => {
        const words = line.split(",");
        if (words.length === 2) {
            const engWord = words[0].trim(); // English word
            const plWord = words[1].trim();  // Polish word
            const pairId = `pair-${index}`; // Unique ID for each pair
            // Add both English and Polish words as separate cards with the same pair ID
            wordPairs.push(
                { id: pairId, text: engWord, lang: 'EN' },
                { id: pairId, text: plWord, lang: 'PL' }
            );
        }
    });

    shuffle(wordPairs); // Shuffle word pairs
    setupBoard(); // Setup the game board

    // Show the game container and hide the word form
    document.getElementById("word-setup").style.display = "none";
    document.getElementById("game-container").style.display = "block";

    updateScoreBoard(); // Initialize the scoreboard
}

// Shuffle function using the Fisher-Yates algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Setup the game board based on shuffled word pairs
function setupBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = ''; // Clear any existing cards
    wordPairs.forEach((pair, index) => {
        const card = document.createElement("div");
        card.classList.add("card"); // Add styling
        card.dataset.index = index; // Unique index for the card
        card.dataset.pairId = pair.id; // Unique pair ID
        card.dataset.lang = pair.lang; // Store the language (EN or PL)
        card.innerHTML = ''; // Initially keep the card blank
        card.addEventListener("click", () => flipCard(card)); // Add click event listener
        board.appendChild(card); // Add card to the game board
    });
}

// Update the scoreboard and current player display
function updateScoreBoard() {
    const scoreboard = document.getElementById("score-board");
    scoreboard.innerHTML = players.map((player, index) => {
        const isCurrent = index === currentPlayerIndex ? 'current-player' : '';
        return `<div class="player-score ${isCurrent}">${player.name}: ${player.score}</div>`;
    }).join('');
}

// Handle card flipping logic
function flipCard(card) {
    if (boardLocked || card.classList.contains("flipped")) return; // Prevent flipping if locked or already flipped

    card.classList.add("flipped"); // Add flipped class for styling
    card.innerHTML = wordPairs[card.dataset.index].text; // Show the word on the card
    flippedCards.push(card); // Add the card to the flippedCards array

    if (flippedCards.length === 2) {
        checkMatch(); // Check for a match if two cards are flipped
    }
}

// Function to check if two flipped cards form a pair
function checkMatch() {
    const [card1, card2] = flippedCards; // Get the two flipped cards

    // Check if the pair IDs match, meaning these two cards are a matching pair
    const isMatch = card1.dataset.pairId === card2.dataset.pairId;

    if (isMatch) {
        players[currentPlayerIndex].score++; // Award a point to the current player
        updateScoreBoard(); // Update the score display

        // Hide matched cards after a short delay
        setTimeout(() => {
            card1.style.visibility = "hidden";
            card2.style.visibility = "hidden";
            flippedCards = []; // Clear flipped cards array

            // Check if the game is over
            if (players.reduce((sum, player) => sum + player.score, 0) === wordPairs.length / 2) {
                const scores = players.map(p => `${p.name}: ${p.score}`).join("\n");
                alert(`Game Over!\nScores:\n${scores}`);
            }
        }, 500);
    } else {
        // Lock the board temporarily and unflip cards after a delay if no match is found
        boardLocked = true;
        setTimeout(() => {
            card1.classList.remove("flipped"); // Remove flipped styling
            card2.classList.remove("flipped"); // Remove flipped styling
            card1.innerHTML = ''; // Hide the word on the card
            card2.innerHTML = ''; // Hide the word on the card
            flippedCards = []; // Reset flipped cards array
            boardLocked = false; // Unlock the board
            nextPlayer(); // Switch to the next player
        }, 1000);
    }
}

// Move to the next player in turn
function nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Cycle to the next player
    updateScoreBoard(); // Update the scoreboard to highlight the current player
}

// Restart the game
function restartGame() {
    document.getElementById("player-config").reset();
    document.getElementById("word-setup").reset();
    document.getElementById("player-config").style.display = "block";
    document.getElementById("word-setup").style.display = "none";
    document.getElementById("game-container").style.display = "none";
    players = [];
    currentPlayerIndex = 0;
}
