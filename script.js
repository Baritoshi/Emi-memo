let images = [];          // Array to store image URLs
let currentPlayer = 1;    // Variable to track the current player (1 or 2)
let flippedCards = [];    // Array to store the currently flipped cards for comparison
let boardLocked = false;  // Boolean to lock the board during match checking
let playerScores = [0, 0];// Array to hold scores for Player 1 and Player 2

document.getElementById("image-form").addEventListener("submit", startGame);

// Function to start the game, triggered on form submission
function startGame(event) {
    event.preventDefault(); // Prevent default form submission
    const inputText = document.getElementById("image-input").value.trim(); // Get and trim the input
    const lines = inputText.split("\n"); // Split input into lines

    images = []; // Reset images array

    // Parse each line to extract image URLs
    lines.forEach((line) => {
        const url = line.trim();
        if (url) {
            // Add two cards for each image URL to form pairs
            images.push({ id: url, src: url });
            images.push({ id: url, src: url });
        }
    });

    shuffle(images); // Shuffle images
    setupBoard(); // Setup the game board
    document.getElementById("image-form").style.display = "none"; // Hide the form
    document.getElementById("game-container").style.display = "block"; // Show the game container
    updateTurnIndicator(); // Initialize turn indicator with player names and scores
}

// Function to shuffle the array of images
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Setup the game board based on shuffled images
function setupBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = ''; // Clear any existing cards
    images.forEach((image, index) => {
        const card = document.createElement("div");
        card.classList.add("card"); // Add styling
        card.dataset.index = index; // Unique index for the card
        card.dataset.id = image.id; // Unique image ID
        const imgElement = document.createElement("img");
        imgElement.src = image.src; // Set image source
        card.appendChild(imgElement); // Add image to the card
        card.addEventListener("click", () => flipCard(card)); // Add click event listener
        board.appendChild(card); // Add card to the game board
    });
}

// Handle card flipping logic
function flipCard(card) {
    if (boardLocked || card.classList.contains("flipped")) return; // Prevent flipping if locked or already flipped

    card.classList.add("flipped"); // Add flipped class for styling
    flippedCards.push(card); // Add the card to the flippedCards array

    if (flippedCards.length === 2) {
        checkMatch(); // Check for a match if two cards are flipped
    }
}

// Function to check if two flipped cards form a pair
function checkMatch() {
    const [card1, card2] = flippedCards; // Get the two flipped cards

    // Check if the image IDs match, meaning these two cards are a matching pair
    const isMatch = card1.dataset.id === card2.dataset.id;

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
            if (playerScores.reduce((a, b) => a + b) === images.length / 2) {
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

// Function to update the turn indicator and scores in the table
function updateTurnIndicator() {
    // Update Player 1 and Player 2 scores
    document.getElementById("player1-score").textContent = `Player 1: ${playerScores[0]}`;
    document.getElementById("player2-score").textContent = `Player 2: ${playerScores[1]}`;

    // Update the current player's turn in the center cell
    document.getElementById("current-player").textContent = `Player ${currentPlayer}'s Turn`;
}

// Function to restart the game
function restartGame() {
    document.getElementById("image-form").reset(); // Reset form fields
    document.getElementById("image-input").value = ''; // Clear textarea
    document.getElementById("image-form").style.display = "block"; // Show the form
    document.getElementById("game-container").style.display = "none"; // Hide the game container
    playerScores = [0, 0]; // Reset player scores
    currentPlayer = 1; // Reset to Player 1's turn
    updateTurnIndicator(); // Update turn indicator for reset game
}
