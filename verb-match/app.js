let gameBoard = document.getElementById("game-board");
let scoreDisplay = document.getElementById("score");
let restartButton = document.getElementById("restart-game");
let verbsInputForm = document.getElementById("add-verbs-form");
let verbsInputField = document.getElementById("verbs-input");

let cards = [];
let flippedCards = [];
let score = 0;

let verbs = []; // Start with an empty verb list

// Initialize the game
function initGame() {
    if (verbs.length === 0) {
        alert("Please add some verbs to start the game!");
        return;
    }

    score = 0;
    scoreDisplay.textContent = score;
    gameBoard.innerHTML = "";
    flippedCards = [];

    // Create shuffled cards
    cards = shuffle(
        verbs.flatMap(verb => [
            { text: verb.infinitive, type: "infinitive", matchId: verb.infinitive },
            { text: verb.past, type: "past", matchId: verb.infinitive },
            { text: verb.participle, type: "participle", matchId: verb.infinitive },
            { text: verb.translation, type: "translation", matchId: verb.infinitive }
        ])
    );

    // Render cards
    cards.forEach((card, index) => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.dataset.index = index;
        cardElement.textContent = card.text;

        cardElement.addEventListener("click", () => flipCard(index));
        gameBoard.appendChild(cardElement);
    });
}

// Shuffle the cards
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Flip a card
function flipCard(index) {
    const cardElement = gameBoard.children[index];
    if (cardElement.classList.contains("flipped") || cardElement.classList.contains("hidden")) return;

    cardElement.classList.add("flipped");
    flippedCards.push({ ...cards[index], index });

    if (flippedCards.length === 4) {
        checkMatch();
    }
}

// Check if the flipped cards form a match
function checkMatch() {
    const [card1, card2, card3, card4] = flippedCards;

    if (
        card1.matchId === card2.matchId &&
        card1.matchId === card3.matchId &&
        card1.matchId === card4.matchId
    ) {
        // Correct match
        score += 5;
        flippedCards.forEach(card => gameBoard.children[card.index].classList.add("hidden"));
    } else {
        // Incorrect match
        score -= 2;
        setTimeout(() => {
            flippedCards.forEach(card => gameBoard.children[card.index].classList.remove("flipped"));
        }, 1000);
    }

    flippedCards = [];
    scoreDisplay.textContent = score;

    // Check if the game is over
    if ([...gameBoard.children].every(card => card.classList.contains("hidden"))) {
        alert("Congratulations! Your final score is: " + score);
    }
}

// Add verbs from user input
verbsInputForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const rawInput = verbsInputField.value.trim();
    if (!rawInput) {
        alert("Please enter some verbs!");
        return;
    }

    const newVerbs = rawInput.split("\n").map(line => {
        const [infinitive, past, participle, translation] = line.split(",");
        if (!infinitive || !past || !participle || !translation) {
            alert("Each line must have 4 parts: infinitive, past, past participle, translation.");
            return null;
        }
        return { infinitive: infinitive.trim(), past: past.trim(), participle: participle.trim(), translation: translation.trim() };
    }).filter(Boolean);

    if (newVerbs.length === 0) {
        alert("No valid verbs were added.");
        return;
    }

    verbs = [...verbs, ...newVerbs];
    verbsInputField.value = ""; // Clear the input field
    alert(`${newVerbs.length} verbs added successfully!`);

    // Restart the game with new verbs
    initGame();
});

// Restart the game
restartButton.addEventListener("click", initGame);

// Start the game (empty initially)
initGame();
