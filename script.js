let wordPairs = [];       // Array to store word pairs with unique IDs
let currentPlayer = 1;    // Variable to track the current player (1 or 2)
let flippedCards = [];    // Array to store the currently flipped cards for comparison
let boardLocked = false;  // Boolean to lock the board during match checking
let playerScores = [0, 0];// Array to hold scores for Player 1 and Player 2

document.getElementById("word-form").addEventListener("submit", startGame);

// Function to start the game, triggered on form submission
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
    document.getElementById("word-form").style.display = "none"; // Hide the form
    document.getElementById("game-container").style.display = "block"; // Show the game container
    updateTurnIndicator(); // Initialize turn indicator with player names and scores
}

// Function to update the turn indicator and scores in the table
function updateTurnIndicator() {
    // Update Player 1 and Player 2 scores
    document.getElementById("player1-score").textContent = `Player 1: ${playerScores[0]}`;
    document.getElementById("player2-score").textContent = `Player 2: ${playerScores[1]}`;

    // Update the current player's turn in the center cell
    document.getElementById("current-player").textContent = `Player ${currentPlayer}'s Turn`;
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
        // Award a point to the current player
        playerScores[currentPlayer - 1]++;
        updateTurnIndicator(); // Update the score display

        // Hide matched cards after a short delay
        setTimeout(() => {
            card1.style.visibility = "hidden";
            card2.style.visibility = "hidden";
            flippedCards = []; // Clear flipped cards array
            // Check if the game is over by seeing if all pairs are matched
            if (playerScores.reduce((a, b) => a + b) === wordPairs.length / 2) {
                // Display game-over alert with final scores
                setTimeout(() => alert(`Game Over! Final Scores - Player 1: ${playerScores[0]}, Player 2: ${playerScores[1]}`), 500);
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
            switchPlayer(); // Switch to the other player if there was no match
        }, 1000);
    }
}

// Function to switch the active player if a match was not found
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1; // Toggle between Player 1 and Player 2
    updateTurnIndicator(); // Update the turn indicator with the new player
}

// Function to restart the game, resetting scores and displaying the form again
function restartGame() {
    document.getElementById("word-form").reset(); // Reset form fields
    document.getElementById("word-input").value = ''; // Clear textarea
    document.getElementById("word-form").style.display = "block"; // Show the form
    document.getElementById("game-container").style.display = "none"; // Hide the game container
    playerScores = [0, 0]; // Reset player scores
    currentPlayer = 1; // Reset to Player 1's turn
    updateTurnIndicator(); // Update turn indicator for reset game
}