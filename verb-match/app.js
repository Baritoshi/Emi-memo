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

// Update Lives Display
function updateLivesDisplay() {
    livesDisplay.textContent = lives;

    // Clear existing hearts
    heartsContainer.innerHTML = "";
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement("img");
        heart.src = "https://img.icons8.com/emoji/48/heart-suit.png"; // Example heart icon
        heart.classList.add("heart-icon");
        heartsContainer.appendChild(heart);
    }
}

// Update Score Display
function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}

// Simple shuffle function (Fisher-Yates)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

// Initialize Game
function initGame() {
    if (verbs.length === 0) {
        alert("No verbs available. Please add verbs first.");
        return;
    }

    // Reset containers
    targetsContainer.innerHTML = "";
    draggablesContainer.innerHTML = "";
    lives = 5;
    score = 0;
    updateLivesDisplay();
    updateScoreDisplay();

    // Create target slots for each verb
    verbs.forEach(verb => {
        const target = document.createElement("div");
        target.classList.add("target");

        // Show the infinitive as a label, with Past, Participle, Translation as slots
        target.innerHTML = `
      <h3>${verb.infinitive}</h3>
      <div class="slot" data-answer="${verb.past.trim().toLowerCase()}"></div>
      <div class="slot" data-answer="${verb.participle.trim().toLowerCase()}"></div>
      <div class="slot" data-answer="${verb.translation.trim().toLowerCase()}"></div>
    `;
        targetsContainer.appendChild(target);
    });

    // Gather all the words you want to randomize (past, participle, translation)
    let allWords = verbs.flatMap(v => [
        v.past.trim(),
        v.participle.trim(),
        v.translation.trim()
    ]);

    // Shuffle the words
    allWords = shuffle(allWords);

    // Create draggable elements
    allWords.forEach(word => {
        const draggable = document.createElement("div");
        draggable.classList.add("draggable");
        draggable.textContent = word;
        draggablesContainer.appendChild(draggable);

        // Click-to-select logic
        draggable.addEventListener("click", () => {
            // If this word is already selected, deselect it
            if (selectedWord === draggable) {
                draggable.classList.remove("selected");
                selectedWord = null;
            } else {
                // Deselect any previously selected word
                if (selectedWord) {
                    selectedWord.classList.remove("selected");
                }
                // Select this one
                draggable.classList.add("selected");
                selectedWord = draggable;
            }
        });
    });

    // Allow slots to be clicked so the selected word can be placed
    document.querySelectorAll(".slot").forEach(slot => {
        slot.addEventListener("click", () => {
            if (selectedWord) {
                // If there's already a word in the slot, swap them back to the pool
                if (slot.textContent.trim() !== "") {
                    const existingWord = slot.textContent.trim();
                    const newDraggable = document.createElement("div");
                    newDraggable.classList.add("draggable");
                    newDraggable.textContent = existingWord;
                    draggablesContainer.appendChild(newDraggable);

                    // Re-attach the click-to-select logic
                    newDraggable.addEventListener("click", () => {
                        if (selectedWord === newDraggable) {
                            newDraggable.classList.remove("selected");
                            selectedWord = null;
                        } else {
                            if (selectedWord) {
                                selectedWord.classList.remove("selected");
                            }
                            newDraggable.classList.add("selected");
                            selectedWord = newDraggable;
                        }
                    });
                }

                // Place the selected word in the slot
                slot.textContent = selectedWord.textContent;

                // Remove the draggable from the pool
                selectedWord.remove();
                selectedWord = null;
            }
        });
    });

    // Show the game section
    gameSection.style.display = "block";
}

// Handle Form Submission
addVerbsForm.addEventListener("submit", e => {
    e.preventDefault();

    // Convert each line into an object with 4 properties, trimming spaces
    verbs = verbsInputField.value.trim().split("\n").map(line => {
        const parts = line.split(",").map(item => item.trim());
        const [inf, past, part, trans] = parts;
        return {
            infinitive: inf || "",
            past: past || "",
            participle: part || "",
            translation: trans || ""
        };
    });

    // Hide input section, start the game
    inputSection.style.display = "none";
    initGame();
});

// Check Answers
checkAnswersButton.addEventListener("click", () => {
    const slots = document.querySelectorAll(".slot");
    let allCorrect = true;
    let anyIncorrect = false;

    slots.forEach(slot => {
        const placedWord = slot.textContent.trim().toLowerCase();
        const correctWord = slot.dataset.answer.trim().toLowerCase();

        // If the slot is empty, it's definitely not correct
        if (!placedWord) {
            allCorrect = false;
            anyIncorrect = true;
            // Optional: visually mark empty slots
            slot.classList.remove("slot-correct");
            slot.classList.add("slot-incorrect");
            // Score: minus 5 for empty/incorrect
            score -= 5;
            return;
        }

        // Check correctness
        if (placedWord === correctWord) {
            // Mark visually as correct
            slot.classList.add("slot-correct");
            slot.classList.remove("slot-incorrect");
            // Score: plus 10 for correct
            score += 10;
        } else {
            // Mark visually as incorrect
            slot.classList.remove("slot-correct");
            slot.classList.add("slot-incorrect");

            // Move the incorrect word back to the pool
            const wordDiv = document.createElement("div");
            wordDiv.classList.add("draggable", "incorrect");
            wordDiv.textContent = slot.textContent;
            draggablesContainer.appendChild(wordDiv);

            // Rebind click-to-select
            wordDiv.addEventListener("click", () => {
                if (selectedWord === wordDiv) {
                    wordDiv.classList.remove("selected");
                    selectedWord = null;
                } else {
                    if (selectedWord) {
                        selectedWord.classList.remove("selected");
                    }
                    wordDiv.classList.add("selected");
                    selectedWord = wordDiv;
                }
            });

            // Clear the slot
            slot.textContent = "";

            allCorrect = false;
            anyIncorrect = true;
            // Score: minus 5 for incorrect
            score -= 5;
        }
    });

    // Update score display after evaluating all slots
    updateScoreDisplay();

    // If there were any incorrect answers, lose 1 life
    if (anyIncorrect) {
        lives--;
        updateLivesDisplay();
        if (lives <= 0) {
            alert("Game Over!\nYour final score was: " + score);
            restartGame();
            return;
        }
    }

    // If everything was correct, show success message
    if (allCorrect && !anyIncorrect) {
        score += 50;
        alert(`Well Done!\nYour final score is: ${score}`);
    }
});

// Restart Game
restartGameButton.addEventListener("click", () => {
    restartGame();
});

// Utility function to reset the entire game
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
    selectedWord = null;
}
