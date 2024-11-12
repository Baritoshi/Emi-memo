let wordPairs = [];       // Array to store word pairs with unique IDs
let currentPlayer = 1;    // Variable to track the current player (1 or 2)
let flippedCards = [];    // Array to store the currently flipped cards for comparison
let boardLocked = false;  // Boolean to lock the board during match checking
let playerScores = [0, 0];// Array to hold scores for Player 1 and Player 2

document.getElementById("word-form").addEventListener("submit", startGame);

// Function to add new input fields for additional word pairs
function addPair() {
    const container = document.getElementById("pairs-input");
    container.innerHTML += '<input type="text" placeholder="English Word" required><input type="text" placeholder="Polish Word" required>';
}

// Function to start the game, triggered on form submission
function startGame(event) {
    event.preventDefault(); // Prevent default form submission
    const inputs = document.querySelectorAll("#pairs-input input");
    wordPairs = []; // Reset word pairs array

    // Collect pairs of words from the form input fields
    for (let i = 0; i < inputs.length; i += 2) {
        const engWord = inputs[i].value;
        const plWord = inputs[i + 1].value;
        // Create a pair with a unique ID and both language versions
        const pairId = `pair-${i / 2}`;
        wordPairs.push(
            { id: pairId, text: engWord, lang: 'EN' },
            { id: pairId, text: plWord, lang: 'PL' }
        );
    }

    shuffle(wordPairs); // Shuffle word pairs
    setupBoard(); // Setup the game board
    document.getElementById("word-form").style.display = "none"; // Hide the form
    document.getElementById("game-container").style.display = "block"; // Show the game container
    updateTurnIndicator(); // Initialize turn indicator with player names and scores
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

// Function to update the turn indicator, showing current player and scores
function updateTurnIndicator() {
    document.getElementById("turn-indicator").textContent = `Player ${currentPlayer}'s Turn - Player 1: ${playerScores[0]}, Player 2: ${playerScores[1]}`;
}

// Function to restart the game, resetting scores and displaying the form again
function restartGame() {
    document.getElementById("word-form").reset(); // Reset form fields
    document.getElementById("pairs-input").innerHTML = '<input type="text" placeholder="English Word" required><input type="text" placeholder="Polish Word" required>'; // Reset to initial input fields
    document.getElementById("word-form").style.display = "block"; // Show the form
    document.getElementById("game-container").style.display = "none"; // Hide the game container
    playerScores = [0, 0]; // Reset player scores
    currentPlayer = 1; // Reset to Player 1's turn
    updateTurnIndicator(); // Update turn indicator for reset game
}
