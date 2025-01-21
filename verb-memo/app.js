// DOM Elements
const DOM = {
    gameBoard: document.getElementById("game-board"),
    scoreDisplay: document.getElementById("score"),
    restartButton: document.getElementById("restart-game"),
    verbsInputForm: document.getElementById("add-verbs-form"),
    verbsInputField: document.getElementById("verbs-input"),
};

// Game State
const state = {
    cards: [],
    flippedCards: [],
    score: 0,
    verbs: [],
};

// Initialize the Game
function initGame() {
    if (state.verbs.length === 0) {
        alert("Please add some verbs to start the game!");
        return;
    }

    resetGameState();

    // Create and shuffle cards
    state.cards = createShuffledCards(state.verbs);

    // Render cards to the game board
    renderCards(state.cards);
}

// Reset Game State
function resetGameState() {
    state.score = 0;
    state.flippedCards = [];
    DOM.scoreDisplay.textContent = state.score;
    DOM.gameBoard.innerHTML = "";
}

// Create and Shuffle Cards
function createShuffledCards(verbs) {
    const cards = verbs.flatMap(verb => [
        { text: verb.infinitive, type: "infinitive", matchId: verb.infinitive },
        { text: verb.past, type: "past", matchId: verb.infinitive },
        { text: verb.participle, type: "participle", matchId: verb.infinitive },
        { text: verb.translation, type: "translation", matchId: verb.infinitive },
    ]);
    return shuffle(cards);
}

// Render Cards
function renderCards(cards) {
    cards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        DOM.gameBoard.appendChild(cardElement);
    });
}

// Create Individual Card Element
function createCardElement(card, index) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.dataset.index = index;
    cardElement.dataset.matchId = card.matchId;
    cardElement.textContent = card.text;

    cardElement.addEventListener("click", () => flipCard(index));
    return cardElement;
}

// Shuffle Array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Handle Card Flip
function flipCard(index) {
    const cardElement = DOM.gameBoard.children[index];
    if (cardElement.classList.contains("selected") || cardElement.classList.contains("hidden")) {
        return; // Prevent reselecting an already selected or hidden card
    }

    // Highlight the selected card
    cardElement.classList.add("selected");
    state.flippedCards.push({ ...state.cards[index], element: cardElement });

    // If 4 cards are selected, check for a match
    if (state.flippedCards.length === 4) {
        checkMatch();
    }
}

// Check if Flipped Cards Match
function checkMatch() {
    const [card1, card2, card3, card4] = state.flippedCards;
    const allMatch = card1.matchId === card2.matchId && card1.matchId === card3.matchId && card1.matchId === card4.matchId;

    if (allMatch) {
        handleCorrectMatch();
    } else {
        handleIncorrectMatch();
    }
}

// Handle Correct Match
function handleCorrectMatch() {
    state.flippedCards.forEach(card => card.element.classList.add("hidden")); // Hide cards
    updateScore(10);
    state.flippedCards = [];
    checkIfGameComplete();
}

// Handle Incorrect Match
function handleIncorrectMatch() {
    setTimeout(() => {
        state.flippedCards.forEach(card => card.element.classList.remove("selected")); // Remove highlighting
        state.flippedCards = [];
    }, 1000);
    updateScore(-5);
}

// Update Score
function updateScore(amount) {
    state.score += amount;
    DOM.scoreDisplay.textContent = state.score;
}

// Check if Game is Complete
function checkIfGameComplete() {
    if (document.querySelectorAll(".card:not(.hidden)").length === 0) {
        alert(`Congratulations! Your final score is ${state.score}.`);
    }
}

// Handle Verbs Input
DOM.verbsInputForm.addEventListener("submit", e => {
    e.preventDefault();

    const rawInput = DOM.verbsInputField.value.trim();
    if (!rawInput) {
        alert("Please enter some verbs!");
        return;
    }

    const newVerbs = parseVerbsInput(rawInput);
    if (newVerbs.length > 0) {
        state.verbs = [...state.verbs, ...newVerbs];
        DOM.verbsInputField.value = ""; // Clear input field
        alert(`${newVerbs.length} verbs added successfully!`);
        initGame();
    }
});

// Parse Verbs Input
function parseVerbsInput(input) {
    return input.split("\n").map(line => {
        const [infinitive, past, participle, translation] = line.split(",");
        if (!infinitive || !past || !participle || !translation) {
            alert("Each line must have 4 parts: infinitive, past, past participle, translation.");
            return null;
        }
        return {
            infinitive: infinitive.trim(),
            past: past.trim(),
            participle: participle.trim(),
            translation: translation.trim(),
        };
    }).filter(Boolean);
}

// Restart Game
DOM.restartButton.addEventListener("click", initGame);

// Initialize the Game
initGame();
