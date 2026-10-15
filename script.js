```javascript
"use strict";

// ==========================================
// THE LOST DIARY — GAME ENGINE
// ==========================================

const $ = (id) => document.getElementById(id);

const SAVE_KEY = "theLostDiarySaveV1";
const TOTAL_CHAPTERS = 5;

let game = null;
let timerInterval = null;
let audioContext = null;
let soundEnabled = false;
let puzzleSolvedThisVisit = false;

const evidenceCatalog = {
  letter: {
    title: "The Unsent Letter",
    icon: "✉",
    description:
      "A letter dated October 13. The writer says, " +
      '"The truth is hidden where time stands still."'
  },
  photograph: {
    title: "The Family Photograph",
    icon: "▧",
    description:
      "A family portrait. A handwritten note on the back reads: " +
      '"Count the people who are looking away."'
  },
  clock: {
    title: "The Stopped Clock",
    icon: "◷",
    description:
      "The hallway clock stopped at 8:25. It may be more than a coincidence."
  },
  book: {
    title: "The Hollow Book",
    icon: "▤",
    description:
      "A book with a hollow centre. Inside is a small brass key."
  },
  diary: {
    title: "The Lost Diary",
    icon: "▧",
    description:
      "The missing writer's diary. Its final pages reveal a carefully hidden truth."
  },
  tornNote: {
    title: "The Torn Note",
    icon: "✎",
    description:
      "A fragment reads: 'The third number is the first number reversed.'"
  }
};

const puzzles = {
  clock: {
    title: "The Frozen Clock",
    question:
      "The clock stopped at 8:25. Enter the four digits shown by the time, " +
      "without the colon.",
    answer: ["0825", "825"],
    hint: "Read the stopped clock. Write the hour followed by the minutes.",
    success:
      "The clock clicks. A hidden compartment opens behind its face.",
    reward: "clock",
    next: "clockSolved"
  },

  drawer: {
    title: "The Locked Drawer",
    question:
      "A note says: OCT 13. The lock accepts a four-digit code in MMDD format. " +
      "What is the code?",
    answer: ["1013"],
    hint: "October is the tenth month. Combine the month and day as MMDD.",
    success:
      "Click! The drawer opens, revealing an old photograph and a torn note.",
    reward: "photograph",
    reward2: "tornNote",
    next: "drawerSolved"
  },

  final: {
    title: "The Diary Lock",
    question:
      "Three clues: the stopped clock gives 0825; the letter is dated October 13; " +
      "the torn note says the third number is the first number reversed. " +
      "Enter the four-digit diary code: month and day of the letter.",
    answer: ["1013"],
    hint: "The date on the letter is October 13. Use MMDD format.",
    success:
      "The lock opens. The missing writer's final confession waits inside.",
    reward: "diary",
    next: "diarySolved"
  }
};

const scenes = {
  letter: {
    chapter: 1,
    label: "CHAPTER ONE",
    title: "The Mysterious Letter",
    symbol: "✉",
    text:
      "Rain lashes the windows of your small room. At midnight, " +
      "an envelope slides beneath your door. There is no stamp, no name—" +
      "only three words written in silver ink: FIND THE DIARY.\n\n" +
      "Inside is a photograph of Blackthorn Manor, abandoned for twenty years. " +
      "The writer, Eleanor Vale, vanished on October 13. Nobody ever discovered why.",
    choices: [
      {
        label: "Study the letter carefully",
        detail: "Look for a hidden message.",
        next: "studyLetter",
        points: 10
      },
      {
        label: "Go straight to Blackthorn Manor",
        detail: "Begin the investigation.",
        next: "manorGate",
        points: 5
      }
    ]
  },

  studyLetter: {
    chapter: 1,
    label: "CHAPTER ONE",
    title: "Ink and Secrets",
    symbol: "✒",
    text:
      "Under the light, invisible writing appears between the lines: " +
      '"The truth is hidden where time stands still." A date is scratched " +
      "into the envelope: October 13.\n\nYou preserve the letter as evidence. " +
      "Whatever happened to Eleanor, the date matters.",
    evidence: ["letter"],
    choices: [
      {
        label: "Head to Blackthorn Manor",
        detail: "Follow the only lead you have.",
        next: "manorGate",
        points: 5
      }
    ]
  },

  manorGate: {
    chapter: 1,
    label: "CHAPTER ONE",
    title: "Blackthorn Manor",
    symbol: "♜",
    text:
      "The iron gate groans open. The mansion rises from the fog, its windows " +
      "dark except for one candle on the upper floor.\n\n" +
      "A stone plaque beside the entrance reads: 'Time remembers what people forget.' " +
      "You hear a clock ticking somewhere inside.",
    choices: [
      {
        label: "Enter the mansion",
        detail: "The front door is slightly open.",
        next: "hallway",
        points: 5
      },
      {
        label: "Search the garden first",
        detail: "Something glints beneath the dead roses.",
        next: "garden",
        points: 10
      }
    ]
  },

  garden: {
    chapter: 1,
    label: "CHAPTER ONE",
    title: "The Dead Rose Garden",
    symbol: "❀",
    text:
      "Beneath the roses, you find a rusted key and a folded scrap of paper. " +
      "The paper has a single sentence: 'Never trust the time shown by a living clock.'\n\n" +
      "You pocket the key. A narrow path leads to the rear entrance.",
    evidence: ["tornNote"],
    choices: [
      {
        label: "Use the rear entrance",
        detail: "The key fits the old lock.",
        next: "hallway",
        points: 10
      }
    ]
  },

  hallway: {
    chapter: 2,
    label: "CHAPTER TWO",
    title: "The Silent Hallway",
    symbol: "◷",
    text:
      "The air smells of dust and extinguished candles. Portraits line the walls. " +
      "At the far end, a grandfather clock has stopped at 8:25.\n\n" +
      "Three doors stand before you: a study, a library and a locked storage room. " +
      "The clock's glass is scratched from the inside.",
    choices: [
      {
        label: "Inspect the stopped clock",
        detail: "The hands haven't moved in decades.",
        next: "clockPuzzle",
        points: 10
      },
      {
        label: "Explore the library",
        detail: "Books cover every wall.",
        next: "library",
        points: 5
      },
      {
        label: "Search the study",
        detail: "A desk drawer is locked.",
        next: "study",
        points: 5
      }
    ]
  },

  clockPuzzle: {
    chapter: 2,
    label: "CHAPTER TWO",
    title: "The Frozen Clock",
    symbol: "◷",
    text:
      "The clock face has a tiny keyhole. Beneath it, four empty squares " +
      "are engraved into the wood.\n\n" +
      "A message appears under the glass: 'Write what time forgot.' " +
      "You suspect the stopped time itself is the key.",
    puzzle: "clock",
    choices: [
      {
        label: "Step back into the hallway",
        detail: "Investigate another room.",
        next: "hallway",
        points: 0
      }
    ]
  },

  clockSolved: {
    chapter: 2,
    label: "CHAPTER TWO",
    title: "Behind the Clock",
    symbol: "✦",
    text:
      "A hidden compartment slides open. Inside is a photograph of Eleanor " +
      "standing with three people. Two look directly at the camera. One looks away.\n\n" +
      "On the back, Eleanor wrote: 'One of them knows why I disappeared.'",
    choices: [
      {
        label: "Take the photograph to the study",
        detail: "Perhaps the desk holds another clue.",
        next: "study",
        points: 10
      },
      {
        label: "Search the library",
        detail: "The books may explain the photograph.",
        next: "library",
        points: 5
      }
    ]
  },

  library: {
    chapter: 2,
    label: "CHAPTER TWO",
    title: "The Library of Whispers",
    symbol: "▤",
    text:
      "Thousands of books fill the room. One volume is newer than the others. " +
      "Its title is 'A History of Blackthorn Manor.'\n\n" +
      "When you pull it out, you hear a click. A small brass key falls from its hollow centre.",
    evidence: ["book"],
    choices: [
      {
        label: "Take the book and return to the hallway",
        detail: "Keep the key safe.",
        next: "hallway",
        points: 5
      },
      {
        label: "Try the key on the study drawer",
        detail: "The locked drawer may fit it.",
        next: "study",
        points: 10
      }
    ]
  },

  study: {
    chapter: 2,
    label: "CHAPTER TWO",
    title: "The Writer's Study",
    symbol: "✎",
    text:
      "A writing desk sits beneath a cracked mirror. Its drawer has a four-digit " +
      "combination lock. On the desk, a calendar is open to October. The 13th is circled.\n\n" +
      "A note reads: 'The day is the key. The month comes first.'",
    puzzle: "drawer",
    choices: [
      {
        label: "Return to the hallway",
        detail: "Explore before trying again.",
        next: "hallway",
        points: 0
      }
    ]
  },

  drawerSolved: {
    chapter: 3,
    label: "CHAPTER THREE",
    title: "The Photograph's Secret",
    symbol: "▧",
    text:
      "Inside the drawer is a family photograph and a torn note. The photograph " +
      "shows Eleanor with her brother, Thomas, and the family solicitor, Mr. Ashford.\n\n" +
      "Thomas looks away from the camera. The note reads: 'He knew the truth, " +
      "but he did not tell it.' Is Thomas a witness—or a suspect?",
    evidence: ["photograph", "tornNote"],
    choices: [
      {
        label: "Accuse Thomas",
        detail: "Trust your first instinct.",
        next: "accuseThomas",
        points: 0
      },
      {
        label: "Keep investigating",
        detail: "One clue isn't enough.",
        next: "librarySecret",
        points: 10
      }
    ]
  },

  accuseThomas: {
    chapter: 3,
    label: "CHAPTER THREE",
    title: "A Hasty Accusation",
    symbol: "⚖",
    text:
      "Your accusation feels convincing—until you notice a second photograph " +
      "hidden beneath the desk. Thomas is holding a letter addressed to Eleanor. " +
      "He may have been trying to protect her, not harm her.\n\n" +
      "You record the mistake in your journal. The case is far from over.",
    choices: [
      {
        label: "Read the letter and reconsider",
        detail: "Follow the evidence, not assumptions.",
        next: "librarySecret",
        points: 5
      }
    ]
  },

  librarySecret: {
    chapter: 3,
    label: "CHAPTER THREE",
    title: "The Missing Page",
    symbol: "▤",
    text:
      "A loose page in the history book describes a sealed room beneath the manor. " +
      "Only the family solicitor knew its location.\n\n" +
      "A map marks a door behind the study mirror. You push the mirror aside " +
      "and discover a narrow staircase descending into darkness.",
    choices: [
      {
        label: "Descend into the hidden room",
        detail: "There is no turning back now.",
        next: "basement",
        points: 10
      },
      {
        label: "Pause and review your evidence",
        detail: "Make sure you haven't missed anything.",
        next: "evidencePause",
        points: 0
      }
    ]
  },

  evidencePause: {
    chapter: 3,
    label: "CHAPTER THREE",
    title: "A Moment to Think",
    symbol: "◇",
    text:
      "You review your discoveries. The stopped clock, the October date, " +
      "and the torn note seem connected. Somewhere below, a lock clicks once.",
    choices: [
      {
        label: "Descend into the hidden room",
        detail: "The final secrets are waiting.",
        next: "basement",
        points: 5
      }
    ]
  },

  basement: {
    chapter: 4,
    label: "CHAPTER FOUR",
    title: "The Room Beneath",
    symbol: "♧",
    text:
      "The staircase ends at a stone chamber. A small table holds an old diary " +
      "secured with a combination lock. Three inscriptions surround it:\n\n" +
      "TIME: 08:25\nDATE: OCTOBER 13\nNOTE: THE DAY IS THE KEY.\n\n" +
      "A final inscription reads: 'The month comes first. The day follows.'",
    choices: [
      {
        label: "Examine the diary lock",
        detail: "Use the clues you've collected.",
        next: "finalPuzzle",
        points: 10
      },
      {
        label: "Return to the hallway",
        detail: "Review the mansion before opening the diary.",
        next: "hallway",
        points: 0
      }
    ]
  },

  finalPuzzle: {
    chapter: 4,
    label: "CHAPTER FOUR",
    title: "The Diary Lock",
    symbol: "▣",
    text:
      "The diary's brass lock has four digits. The date on Eleanor's letter " +
      "is October 13. The inscription says to place the month before the day.\n\n" +
      "Enter the date in MMDD format. Every clue has led you here.",
    puzzle: "final",
    choices: [
      {
        label: "Think through the clues again",
        detail: "You can try the lock as many times as needed.",
        next: "finalPuzzle",
        points: 0
      }
    ]
  },

  diarySolved: {
    chapter: 5,
    label: "FINAL CHAPTER",
    title: "The Lost Diary",
    symbol: "▧",
    text:
      "The lock opens with a soft click. Inside the diary, Eleanor's final entry " +
      "reveals the truth: she discovered that Mr. Ashford had been stealing " +
      "her family's inheritance. Thomas helped her escape and kept her hiding place secret.\n\n" +
      "Eleanor left the mansion willingly. She wanted the evidence to survive " +
      "until someone brave enough to uncover it arrived. You have solved the mystery.",
    choices: [
      {
        label: "Reveal the truth publicly",
        detail: "Bring the evidence into the light.",
        next: "trueEnding",
        points: 20
      },
      {
        label: "Keep Eleanor's location secret",
        detail: "Protect the person behind the story.",
        next: "secretEnding",
        points: 20
      }
    ]
  },

  trueEnding: {
    ending: true,
    title: "The Truth Revealed",
    symbol: "✧",
    text:
      "You publish the evidence and clear Thomas's name. The stolen inheritance " +
      "is returned to the family. Blackthorn Manor is no longer a place of rumours, " +
      "but a monument to a mystery finally solved.\n\n" +
      "ENDING UNLOCKED: THE TRUTH REVEALED."
  },

  secretEnding: {
    ending: true,
    title: "The Keeper of Secrets",
    symbol: "☾",
    text:
      "You preserve the diary and protect Eleanor's privacy. The world may never " +
      "learn every detail, but the truth is safe in your hands. A final letter arrives: " +
      "'Thank you for understanding.'\n\n" +
      "ENDING UNLOCKED: THE KEEPER OF SECRETS."
  }
};

// ==========================================
// GAME INITIALISATION
// ==========================================

function newGame() {
  game = {
    scene: "letter",
    evidence: [],
    journal: [],
    visited: [],
    score: 0,
    startedAt: Date.now(),
    elapsedBeforeSave: 0,
    hintCount: 0,
    mistakes: 0,
    ended: false
  };

  puzzleSolvedThisVisit = false;
  clearSavedGame();
  showScreen("gameScreen");
  enterScene("letter");
  startTimer();
  updateStatus("Your investigation has begun.");
}

function enterScene(sceneId) {
  const scene = scenes[sceneId];
  if (!scene || !game) return;

  game.scene = sceneId;
  puzzleSolvedThisVisit = false;

  if (!game.visited.includes(sceneId)) {
    game.visited.push(sceneId);
    game.score += scene.chapter ? 2 : 0;
  }

  $("chapterLabel").textContent = scene.label || "CASE CLOSED";
  $("chapterEyebrow").textContent = scene.label || "CASE CLOSED";
  $("sceneTitle").textContent = scene.title;
  $("sceneSymbol").textContent = scene.symbol || "✧";
  $("storyText").textContent = scene.text;

  $("choiceArea").replaceChildren();
  $("puzzleArea").classList.add("hidden");

  if (scene.evidence) {
    scene.evidence.forEach(addEvidence);
  }

  addJournal(scene.title, scene.text);

  if (scene.puzzle) {
    renderPuzzle(scene.puzzle);
  }

  (scene.choices || []).forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";

    const textWrap = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = choice.label;
    const detail = document.createElement("small");
    detail.textContent = choice.detail || "";
    detail.style.display = "block";
    detail.style.color = "var(--muted)";
    detail.style.fontSize = "12px";

    textWrap.append(strong, detail);

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "→";

    button.append(textWrap, arrow);
    button.addEventListener("click", () => choose(choice));
    $("choiceArea").appendChild(button);
  });

  updateEvidenceCount();
  updateProgress(scene.chapter || TOTAL_CHAPTERS);
  saveGame();
}

function choose(choice) {
  if (!game || game.ended) return;

  game.score += choice.points || 0;
  playTone(420, 0.06);
  addJournal("Decision", choice.label);

  enterScene(choice.next);
}

// ==========================================
// PUZZLES AND HINTS
// ==========================================

function renderPuzzle(puzzleId) {
  const puzzle = puzzles[puzzleId];
  if (!puzzle) return;

  $("puzzleTitle").textContent = puzzle.title;
  $("puzzleQuestion").textContent = puzzle.question;
  $("puzzleAnswer").value = "";
  $("puzzleFeedback").textContent = "";
  $("puzzleFeedback").classList.remove("error");
  $("hintText").textContent = "";
  $("hintText").classList.add("hidden");
  $("hintButton").disabled = false;
  $("puzzleArea").classList.remove("hidden");
  $("puzzleForm").dataset.puzzle = puzzleId;
}

$("puzzleForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!game) return;

  const puzzleId = $("puzzleForm").dataset.puzzle;
  const puzzle = puzzles[puzzleId];
  if (!puzzle || puzzleSolvedThisVisit) return;

  const answer = $("puzzleAnswer").value.trim().toLowerCase();
  const correct = puzzle.answer.some(
    (expected) => answer === expected.toLowerCase()
  );

  if (!correct) {
    game.mistakes += 1;
    $("puzzleFeedback").textContent =
      "That doesn't unlock it. Re-examine your clues and try again.";
    $("puzzleFeedback").classList.add("error");
    playTone(170, 0.12);
    saveGame();
    return;
  }

  puzzleSolvedThisVisit = true;
  game.score += 25;
  $("puzzleFeedback").textContent = puzzle.success;
  $("puzzleFeedback").classList.remove("error");
  $("puzzleAnswer").disabled = true;
  $("puzzleForm").querySelector("button[type='submit']").disabled = true;
  $("hintButton").disabled = true;

  if (puzzle.reward) addEvidence(puzzle.reward);
  if (puzzle.reward2) addEvidence(puzzle.reward2);

  updateEvidenceCount();
  addJournal("Puzzle solved", puzzle.title + ": correct answer.");
  playTone(660, 0.16);
  playTone(880, 0.18);

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.className = "primary-button";
  continueButton.style.marginTop = "12px";
  continueButton.textContent = "Continue investigation →";
  continueButton.addEventListener("click", () => {
    enterScene(puzzle.next);
  });

  $("puzzleArea").appendChild(continueButton);
  saveGame();
});

$("hintButton").addEventListener("click", () => {
  const puzzleId = $("puzzleForm").dataset.puzzle;
  const puzzle = puzzles[puzzleId];
  if (!puzzle || !game || puzzleSolvedThisVisit) return;

  $("hintText").textContent = "HINT: " + puzzle.hint;
  $("hintText").classList.remove("hidden");
  $("hintButton").disabled = true;

  game.hintCount += 1;
  game.score = Math.max(0, game.score - 5);
  addJournal("Hint used", puzzle.title + ": " + puzzle.hint);
  updateStatus("Hint used: 5 points deducted.");
  saveGame();
});

// ==========================================
// EVIDENCE AND JOURNAL
// ==========================================

function addEvidence(id) {
  if (!game || !evidenceCatalog[id]) return;
  if (game.evidence.includes(id)) return;

  game.evidence.push(id);
  game.score += 10;
  updateEvidenceCount();
  addJournal("Evidence discovered", evidenceCatalog[id].title);
  updateStatus("New evidence found: " + evidenceCatalog[id].title);
  playTone(540, 0.1);
}

function updateEvidenceCount() {
  if ($("evidenceCount") && game) {
    $("evidenceCount").textContent = game.evidence.length;
  }
}

function renderEvidence() {
  const list = $("evidenceList");
  list.replaceChildren();

  $("evidenceEmpty").classList.toggle(
    "hidden",
    Boolean(game && game.evidence.length)
  );

  if (!game) return;

  game.evidence.forEach((id) => {
    const item = evidenceCatalog[id];
    if (!item) return;

    const card = document.createElement("article");
    card.className = "collection-item";

    const heading = document.createElement("h3");
    heading.textContent = item.icon + " " + item.title;

    const description = document.createElement("p");
    description.textContent = item.description;

    card.append(heading, description);
    list.appendChild(card);
  });
}

function addJournal(title, text) {
  if (!game) return;

  game.journal.push({
    title,
    text,
    time: Date.now()
  });

  if (game.journal.length > 150) game.journal.shift();
}

function renderJournal() {
  const list = $("journalList");
  list.replaceChildren();

  $("journalEmpty").classList.toggle(
    "hidden",
    Boolean(game && game.journal.length)
  );

  if (!game) return;

  game.journal.slice().reverse().forEach((entry) => {
    const card = document.createElement("article");
    card.className = "collection-item";

    const heading = document.createElement("h3");
    heading.textContent = entry.title;

    const description = document.createElement("p");
    description.textContent = entry.text;

    card.append(heading, description);
    list.appendChild(card);
  });
}

$("evidenceButton").addEventListener("click", () => {
  renderEvidence();
  showScreen("evidenceScreen");
});

$("journalButton").addEventListener("click", () => {
  renderJournal();
  showScreen("journalScreen");
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.back);
  });
});

// ==========================================
// TIMER, PROGRESS, AND SCORE
// ==========================================

function elapsedSeconds() {
  if (!game) return 0;
  return game.elapsedBeforeSave +
    Math.floor((Date.now() - game.startedAt) / 1000);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (game && !game.ended) {
      $("timerDisplay").textContent = formatTime(elapsedSeconds());
    }
  }, 1000);
}

function updateProgress(chapter) {
  const percent = Math.min(
    100,
    Math.max(5, (chapter / TOTAL_CHAPTERS) * 100)
  );

  $("progressBar").style.width = percent + "%";
}

// ==========================================
// SAVE AND RESUME
// ==========================================

function saveGame() {
  if (!game || game.ended) return;

  game.elapsedBeforeSave = elapsedSeconds();
  game.startedAt = Date.now();

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    $("continueButton").classList.remove("hidden");
  } catch (error) {
    updateStatus("Browser storage unavailable. Keep this tab open.");
  }
}

function clearSavedGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    // Game can still run without local storage.
  }
}

function loadSavedGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || !scenes[data.scene] || data.ended) return null;

    data.evidence = Array.isArray(data.evidence) ? data.evidence : [];
    data.journal = Array.isArray(data.journal) ? data.journal : [];
    data.visited = Array.isArray(data.visited) ? data.visited : [];
    data.score = Number(data.score) || 0;
    data.elapsedBeforeSave = Number(data.elapsedBeforeSave) || 0;
    data.hintCount = Number(data.hintCount) || 0;
    data.mistakes = Number(data.mistakes) || 0;
    data.startedAt = Date.now();

    return data;
  } catch (error) {
    return null;
  }
}

function resumeGame() {
  const saved = loadSavedGame();
  if (!saved) {
    $("continueButton").classList.add("hidden");
    showMessage("No saved case", "Start a new investigation to begin.");
    return;
  }

  game = saved;
  showScreen("gameScreen");
  enterScene(game.scene);
  startTimer();
  $("timerDisplay").textContent = formatTime(elapsedSeconds());
  updateStatus("Your saved investigation has been restored.");
}

$("saveButton").addEventListener("click", () => {
  saveGame();
  updateStatus("Progress saved in this browser.");
  showMessage(
    "Case saved",
    "Your progress is saved in this browser on this device. " +
    "Use the same browser to continue."
  );
});

$("continueButton").addEventListener("click", resumeGame);
$("startButton").addEventListener("click", newGame);

// ==========================================
// ENDINGS
// ==========================================

function finishGame(sceneId) {
  if (!game || game.ended) return;

  game.ended = true;
  game.scene = sceneId;

  clearInterval(timerInterval);
  clearSavedGame();

  const ending = scenes[sceneId];

  $("chapterLabel").textContent = "CASE CLOSED";
  $("endingTitle").textContent = ending.title;
  $("endingText").textContent = ending.text;
  $("finalScore").textContent = game.score;
  $("finalEvidence").textContent =
    game.evidence.length + " / " + Object.keys(evidenceCatalog).length;
  $("finalTime").textContent = formatTime(elapsedSeconds());

  showScreen("endingScreen");
  playTone(523, 0.15);
  playTone(659, 0.15);
  playTone(784, 0.25);
}

$("playAgainButton").addEventListener("click", newGame);

// ==========================================
// SCREENS, MESSAGES, AND SOUND
// ==========================================

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });

  const target = $(screenId);
  if (!target) return;

  target.classList.remove("hidden");
  target.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStatus(message) {
  $("statusMessage").textContent = message;
}

function showMessage(title, text) {
  $("dialogTitle").textContent = title;
  $("dialogText").textContent = text;

  const dialog = $("messageDialog");
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    alert(title + "\n\n" + text);
  }
}

$("dialogClose").addEventListener("click", () => {
  $("messageDialog").close();
});

function playTone(frequency, duration) {
  if (!soundEnabled) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) audioContext = new AudioContextClass();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.04, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Sound is optional; the game works without it.
  }
}

$("soundToggle").addEventListener("click", async () => {
  soundEnabled = !soundEnabled;

  if (soundEnabled) {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (AudioContextClass && !audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext && audioContext.state === "suspended") {
        await audioContext.resume();
      }
    } catch (error) {
      soundEnabled = false;
    }
  }

  $("soundToggle").textContent =
    soundEnabled ? "♫ Sound: On" : "♫ Sound: Off";

  if (soundEnabled) playTone(660, 0.12);
});

// ==========================================
// RESTORE HOME STATE
// ==========================================

(function initialise() {
  const saved = loadSavedGame();

  if (saved) {
    $("continueButton").classList.remove("hidden");
  }

  showScreen("homeScreen");
})();
```
