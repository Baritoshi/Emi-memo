// =============================
// Verb-Match — click-to-place (delegacja zdarzeñ)
// =============================

// Global Variables
let verbs = [];
let lives = 5;
let score = 0;
let selectedWord = null; // Currently selected draggable word

// DOM Elements
const targetsContainer = document.getElementById("targets");
const draggablesContainer = document.getElementById("draggables");
const addVerbsForm = document.getElementById("add-verbs-form");
const verbsInputField = document.getElementById("verbs-input");
const gameSection = document.getElementById("game-section");
const inputSection = document.getElementById("input-section");
const livesDisplay = document.getElementById("lives-display");
const heartsContainer = document.getElementById("hearts-container");
const checkAnswersButton = document.getElementById("check-answers");
const restartGameButton = document.getElementById("restart-game");
const scoreDisplay = document.getElementById("score-display");

// Helpers
function updateLivesDisplay() {
    livesDisplay.textContent = lives;
    heartsContainer.innerHTML = "";
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement("img");
        heart.src = "https://img.icons8.com/emoji/48/heart-suit.png";
        heart.classList.add("heart-icon");
        heart.alt = "life";
        heartsContainer.appendChild(heart);
    }
}
function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] =
            [array[randomIndex], array[currentIndex]];
    }
    return array;
}
function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Initialize Game
function initGame() {
    if (verbs.length === 0) {
        alert("No verbs available. Please add verbs first.");
        return;
    }

    // Reset containers & state
    targetsContainer.innerHTML = "";
    draggablesContainer.innerHTML = "";
    selectedWord = null;
    lives = 5;
    score = 0;
    updateLivesDisplay();
    updateScoreDisplay();

    // Create target slots for each verb
    verbs.forEach(verb => {
        const target = document.createElement("div");
        target.classList.add("target");
        target.innerHTML = `
      <h3>${escapeHtml(verb.infinitive)}</h3>
      <div class="slot" data-answer="${verb.past.trim().toLowerCase()}"></div>
      <div class="slot" data-answer="${verb.participle.trim().toLowerCase()}"></div>
      <div class="slot" data-answer="${verb.translation.trim().toLowerCase()}"></div>
    `;
        targetsContainer.appendChild(target);
    });

    // Gather, shuffle, and render all words (past, participle, translation)
    let allWords = verbs.flatMap(v => [
        v.past.trim(),
        v.participle.trim(),
        v.translation.trim()
    ]);
    allWords = shuffle(allWords);

    allWords.forEach(word => {
        const draggable = document.createElement("div");
        draggable.classList.add("draggable");
        draggable.textContent = word;
        draggablesContainer.appendChild(draggable);
    });

    // Show the game section
    inputSection.style.display = "none";
    gameSection.style.display = "block";
}

// === Delegacja zdarzeñ ===

// 1) Wybór kafelka z puli
draggablesContainer.addEventListener("click", (e) => {
    const tile = e.target.closest(".draggable");
    if (!tile || !draggablesContainer.contains(tile)) return;

    if (selectedWord === tile) {
        tile.classList.remove("selected");
        selectedWord = null;
    } else {
        if (selectedWord) selectedWord.classList.remove("selected");
        tile.classList.add("selected");
        selectedWord = tile;
    }
});

// 2) Wstawienie do slotu
targetsContainer.addEventListener("click", (e) => {
    const slot = e.target.closest(".slot");
    if (!slot || !targetsContainer.contains(slot)) return;
    if (!selectedWord) return;

    // Je¿eli slot ju¿ coœ zawiera — oddaj z powrotem do puli
    const existing = slot.textContent.trim();
    if (existing) {
        const back = document.createElement("div");
        back.classList.add("draggable");
        back.textContent = existing;
        draggablesContainer.appendChild(back);
    }

    // Wstaw wybrane s³owo
    slot.textContent = selectedWord.textContent;

    // Usuñ kafelek z puli i wyczyœæ zaznaczenie
    selectedWord.remove();
    selectedWord = null;
});

// Handle Form Submission
addVerbsForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const lines = verbsInputField.value.trim().split("\n");
    const newVerbsArray = [];
    const existingSignatures = new Set();

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // format: infinitive;past;participle;translation
        const parts = trimmedLine.split(";").map((p) => p.trim());
        if (parts.length !== 4) continue;

        const [inf, past, part, trans] = parts;
        if (!inf || !past || !part || !trans) continue;

        const signature = createSignature(inf, past, part, trans);
        if (existingSignatures.has(signature)) continue;

        existingSignatures.add(signature);
        newVerbsArray.push({
            infinitive: inf,
            past: past,
            participle: part,
            translation: trans,
        });
    }

    if (newVerbsArray.length === 0) {
        alert("No valid verbs added. Please check your input.");
        return;
    }

    // Replace the list (jeœli chcesz dok³adaæ: verbs = [...verbs, ...newVerbsArray])
    verbs = newVerbsArray;

    // Clear the input and start the game
    verbsInputField.value = "";
    initGame();
});

// Helper function to create a "signature" for each verb set
function createSignature(inf, past, part, trans) {
    return [
        inf.toLowerCase(),
        past.toLowerCase(),
        part.toLowerCase(),
        trans.toLowerCase(),
    ].join("§");
}

// Check Answers
checkAnswersButton.addEventListener("click", () => {
    const slots = document.querySelectorAll(".slot");
    let allCorrect = true;
    let anyIncorrect = false;

    slots.forEach(slot => {
        const placedWord = slot.textContent.trim().toLowerCase();
        const correctWord = (slot.dataset.answer || "").trim().toLowerCase();

        if (!placedWord) {
            allCorrect = false;
            anyIncorrect = true;
            slot.classList.remove("slot-correct");
            slot.classList.add("slot-incorrect");
            score -= 5;
            return;
        }

        if (placedWord === correctWord) {
            slot.classList.add("slot-correct");
            slot.classList.remove("slot-incorrect");
            score += 10;
        } else {
            slot.classList.remove("slot-correct");
            slot.classList.add("slot-incorrect");

            // Move the incorrect word back to the pool
            const wordDiv = document.createElement("div");
            wordDiv.classList.add("draggable", "incorrect");
            wordDiv.textContent = slot.textContent;
            draggablesContainer.appendChild(wordDiv);

            // Wyczyœæ slot
            slot.textContent = "";

            allCorrect = false;
            anyIncorrect = true;
            score -= 5;
        }
    });

    updateScoreDisplay();

    if (anyIncorrect) {
        lives--;
        updateLivesDisplay();
        if (lives <= 0) {
            alert("Game Over!\nYour final score was: " + score);
            restartGame();
            return;
        }
    }

    if (allCorrect && !anyIncorrect) {
        score += 50;
        updateScoreDisplay();
        alert(`Well Done!\nYour final score is: ${score}`);
    }
});

// Restart Game
restartGameButton.addEventListener("click", () => {
    restartGame();
});

function restartGame() {
    inputSection.style.display = "block";
    gameSection.style.display = "none";
    verbsInputField.value = "";
    targetsContainer.innerHTML = "";
    draggablesContainer.innerHTML = "";
    lives = 5;
    score = 0;
    updateLivesDisplay();
    updateScoreDisplay();
    verbs = [];
    if (selectedWord) selectedWord.classList.remove("selected");
    selectedWord = null;
}
