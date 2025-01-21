let verbs = [];

// DOM Elements
const targetsContainer = document.getElementById("targets");
const draggablesContainer = document.getElementById("draggables");
const checkAnswersButton = document.getElementById("check-answers");
const restartButton = document.getElementById("restart-game");
const addVerbsForm = document.getElementById("add-verbs-form");
const verbsInputField = document.getElementById("verbs-input");
const gameSection = document.getElementById("game-section");
const inputSection = document.getElementById("input-section");

// Initialize the Game
function initGame() {
    if (verbs.length === 0) {
        alert("No verbs available. Please add verbs first.");
        return;
    }

    targetsContainer.innerHTML = "";
    draggablesContainer.innerHTML = "";

    const shuffledVerbs = shuffle([...verbs]);

    // Create targets
    shuffledVerbs.forEach(verb => {
        const target = document.createElement("div");
        target.classList.add("target");
        target.dataset.infinitive = verb.infinitive;

        target.innerHTML = `
            <h3>${verb.infinitive}</h3>
            <div class="slot" data-slot="past"></div>
            <div class="slot" data-slot="participle"></div>
            <div class="slot" data-slot="translation"></div>
        `;
        targetsContainer.appendChild(target);
    });

    // Create draggable options
    const draggables = shuffle(
        shuffledVerbs.flatMap(verb => [
            { text: verb.past, matchId: `${verb.infinitive}-past` },
            { text: verb.participle, matchId: `${verb.infinitive}-participle` },
            { text: verb.translation, matchId: `${verb.infinitive}-translation` }
        ])
    );

    draggables.forEach(item => {
        const draggable = document.createElement("div");
        draggable.classList.add("draggable");
        draggable.draggable = true;
        draggable.dataset.matchId = item.matchId;
        draggable.textContent = item.text;
        draggablesContainer.appendChild(draggable);
    });

    setupDragAndDrop();
}

// Drag-and-Drop Logic
function setupDragAndDrop() {
    const draggables = document.querySelectorAll(".draggable");
    const slots = document.querySelectorAll(".slot");

    // Handle mouse and touch events for drag start
    draggables.forEach(draggable => {
        draggable.addEventListener("dragstart", () => {
            draggable.classList.add("dragging");
        });

        draggable.addEventListener("dragend", () => {
            draggable.classList.remove("dragging");
        });

        // Touch support
        draggable.addEventListener("touchstart", handleTouchStart);
        draggable.addEventListener("touchmove", handleTouchMove);
        draggable.addEventListener("touchend", handleTouchEnd);
    });

    // Allow slots to accept dragged items
    slots.forEach(slot => {
        slot.addEventListener("dragover", e => {
            e.preventDefault();
            const dragging = document.querySelector(".dragging");
            slot.appendChild(dragging);
        });

        // Touch support
        slot.addEventListener("touchend", handleTouchDrop);
    });
}

// Variables for touch support
let touchTarget = null;

// Touch event handlers
function handleTouchStart(e) {
    e.preventDefault();
    touchTarget = e.target;
    touchTarget.classList.add("dragging");

    const touch = e.touches[0];
    touchTarget.style.position = "absolute";
    touchTarget.style.zIndex = "1000";
    touchTarget.style.left = `${touch.clientX - touchTarget.offsetWidth / 2}px`;
    touchTarget.style.top = `${touch.clientY - touchTarget.offsetHeight / 2}px`;
}

function handleTouchMove(e) {
    e.preventDefault();

    if (touchTarget) {
        const touch = e.touches[0];
        touchTarget.style.left = `${touch.clientX - touchTarget.offsetWidth / 2}px`;
        touchTarget.style.top = `${touch.clientY - touchTarget.offsetHeight / 2}px`;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();

    if (touchTarget) {
        touchTarget.classList.remove("dragging");
        touchTarget.style.position = "";
        touchTarget.style.zIndex = "";
        touchTarget.style.left = "";
        touchTarget.style.top = "";
        touchTarget = null;
    }
}

function handleTouchDrop(e) {
    e.preventDefault();
    if (touchTarget && e.target.classList.contains("slot")) {
        e.target.appendChild(touchTarget);
        touchTarget.classList.remove("dragging");
        touchTarget.style.position = "";
        touchTarget.style.zIndex = "";
        touchTarget.style.left = "";
        touchTarget.style.top = "";
        touchTarget = null;
    }
}

// Add Verbs from User Input
addVerbsForm.addEventListener("submit", e => {
    e.preventDefault();

    const rawInput = verbsInputField.value.trim();
    if (!rawInput) {
        alert("Please enter at least one verb!");
        return;
    }

    const newVerbs = rawInput.split("\n").map(line => {
        const [infinitive, past, participle, translation] = line.split(",");
        if (!infinitive || !past || !participle || !translation) {
            alert("Each line must have 4 parts: infinitive, past, participle, translation.");
            return null;
        }
        return {
            infinitive: infinitive.trim(),
            past: past.trim(),
            participle: participle.trim(),
            translation: translation.trim(),
        };
    }).filter(Boolean);

    if (newVerbs.length === 0) {
        alert("No valid verbs were added.");
        return;
    }

    verbs = [...verbs, ...newVerbs];
    verbsInputField.value = ""; // Clear input field
    alert(`${newVerbs.length} verbs added successfully!`);

    // Show game section and start game
    inputSection.style.display = "none";
    gameSection.style.display = "block";
    initGame();
});

// Check Answers
checkAnswersButton.addEventListener("click", () => {
    const slots = document.querySelectorAll(".slot");
    let allCorrect = true;

    slots.forEach(slot => {
        const dragging = slot.firstChild;

        if (dragging) {
            const matchId = `${slot.parentElement.dataset.infinitive}-${slot.dataset.slot}`;

            if (dragging.dataset.matchId === matchId) {
                dragging.classList.add("correct");
            } else {
                dragging.classList.remove("correct");
                draggablesContainer.appendChild(dragging);
                allCorrect = false;
            }
        } else {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        alert("Well done! You completed the exercise.");
    }
});

// Shuffle Array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Restart Game
restartButton.addEventListener("click", () => {
    initGame();
});

// Start the Game (wait for user input)
gameSection.style.display = "none";
