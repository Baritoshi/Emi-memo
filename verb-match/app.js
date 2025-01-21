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

let selectedElement = null; // Stores the currently selected draggable element

// Initialize the Game
function initGame() {
    if (verbs.length === 0) {
        alert("No verbs available. Please add verbs first.");
        return;
    }

    targetsContainer.innerHTML = "";
    draggablesContainer.innerHTML = "";
    selectedElement = null;

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
        draggable.dataset.matchId = item.matchId;
        draggable.textContent = item.text;
        draggable.addEventListener("click", handleDraggableClick);
        draggablesContainer.appendChild(draggable);
    });

    setupSlots();
}

// Slot Interaction
function setupSlots() {
    const slots = document.querySelectorAll(".slot");

    slots.forEach(slot => {
        slot.addEventListener("click", () => {
            if (selectedElement) {
                slot.appendChild(selectedElement); // Allow any draggable to be placed
                selectedElement.classList.remove("selected");
                selectedElement = null;
            }
        });
    });
}

// Draggable Click Interaction
function handleDraggableClick(e) {
    if (selectedElement) {
        selectedElement.classList.remove("selected"); // Deselect previous element
    }
    selectedElement = e.target; // Set the new selected element
    selectedElement.classList.add("selected");
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
                dragging.classList.add("correct"); // Turn green
                dragging.classList.remove("incorrect");
            } else {
                dragging.classList.remove("correct");
                draggablesContainer.appendChild(dragging); // Move item back to pool
                allCorrect = false;
            }
        } else {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        alert("Well done! You completed the exercise.");
    } else {
        alert("Some items are incorrect. Incorrect items were reset.");
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
