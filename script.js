// Array to store word pairs (English and Polish)
let wordPairs = [];
// Variable to track the current player (1 or 2)
let currentPlayer = 1;
// Array to store the currently flipped cards for comparison
let flippedCards = [];
// Boolean to lock the board and prevent clicks during a check for matches
let boardLocked = false;
// Array to hold scores for Player 1 and Player 2
let playerScores = [0, 0];

// Event listener for the form submission to start the game
document.getElementById("word-form").addEventListener("submit", startGame);

// Function to add a new pair of input fields to the form for additional word pairs
function addPair() {
    const container = document.getElementById("pairs-input");
    container.innerHTML += '<input type="text" placeholder="English Word" required><input type="text" placeholder="Polish Word" required>';
}

// Function to start the game, triggered on form submission
function startGame(event) {
    event.preventDefault(); // Prevent form from submitting traditionally
    const inputs = document.querySelectorAll("#pairs-input input");
    wordPairs = []; // Reset word pairs array

    // Collect pairs of words from the form input fields
    for (let i = 0; i < inputs.length; i += 2) {
        const engWord = inputs[i].value;
        const plWord = inputs[i + 1].value;
        // Add each word pair as two separate objects (one for each language)
        wordPairs.push({ text: engWord, lang: 'EN' }, { text: plWord, lang: 'PL' });
    }

    shuffle(wordPairs); // Shuffle the word pairs to randomize their positions
    setupBoard(); // Set up the game board with the shuffled pairs
    document.getElementById("word-form").style.display = "none"; // Hide the form
    document.getElementById("game-container").style.display = "block"; // Show the game container
    updateTurnIndicator(); // Initialize turn indicator with player names and scores
}

// Function to shuffle the array of word pairs using Fisher-Yates algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Function to set up the game board and display cards based on shuffled word pairs
function setupBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = ''; // Clear any existing cards
    wordPairs.forEach((pair, index) => {
        const card = document.createElement("div");
        card.classList.add("card"); // Add card styling
        card.dataset.index = index; // Unique index for the card
        card.dataset.text = pair.text; // Store the word text
        card.dataset.lang = pair.lang; // Store the language (EN or PL)
        card.innerHTML = ''; // Initially keep the card blank
        card.addEventListener("click", () => flipCard(card)); // Add click event listener for flipping
        board.appendChild(card); // Add card to the game board
    });
}

// Function to handle card flipping logic
function flipCard(card) {
    if (boardLocked || card.classList.contains("flipped")) return; // Prevent flipping if locked or already flipped

    card.classList.add("flipped"); // Add flipped class for styling
    card.innerHTML = card.dataset.text; // Show the word on the card
    flippedCards.push(card); // Add the card to the flippedCards array

    if (flippedCards.length === 2) {
        checkMatch(); // Check for a match if two cards are flipped
    }
}

// Function to check if the two flipped cards match
function checkMatch() {
    const [card1, card2] = flippedCards; // Get the two flipped cards
    // Check if texts match but languages differ (to match English and Polish versions of the same word)
    const isMatch = card1.dataset.text === card2.dataset.text && card1.dataset.lang !== card2.dataset.lang;

    if (isMatch) {
        // Award a point to the current player
        playerScores[currentPlayer - 1]++;
        updateTurnIndicator(); // Update the score display

        // Hide the matched cards after a short delay
        setTimeout(() => {
            card1.style.visibility = "hidden";
            card2.style.visibility = "hidden";
            flippedCards = []; // Clear flipped cards array for the next turn
            // Check if the game is over by seeing if total matches equals half the cards
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