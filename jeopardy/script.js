/*
  =========================================================
  AIQU JEOPARDY - GAMERS WEEK EDITION
  ---------------------------------------------------------
  MOST IMPORTANT PARTS TO EDIT:
    1) SETTINGS   - number of teams, penalty for wrong answers, question timer
    2) gameData   - the categories, questions and answers

  Each category object has:
    - category: the title shown on the board
    - clues: an array of clue objects

  Each clue object has:
    - value: point amount shown on the tile
    - question: what players see first
    - answer: what the host sees / what gets revealed

  Keep the number of clues the same in every category so the
  board stays neat and aligned.
  =========================================================
*/

/* ---------- SETTINGS ---------- */
const MIN_TEAMS = 2;
const MAX_TEAMS = 30;

// With more teams than this, the scoreboard switches to smaller cards
const COMPACT_SCOREBOARD_FROM = 8;

// false = a wrong answer just passes the question to the next team (no points lost)
// true  = a wrong answer also takes the question's points away from that team
const POINTS_LOST_ON_WRONG = false;

// Question timer: the FIRST team to answer a question gets this many seconds.
// If time runs out, the question passes to another team, and that team (and any
// after it) has NO timer. Set to 0 to turn the timer off completely.
const QUESTION_TIME_SECONDS = 60;

// One colour per team (assigned in order, repeating if there are more teams than colours)
const TEAM_COLORS = ["#ff7230", "#ffda4b", "#d77db0", "#69afd8", "#ff5a64", "#b79cff", "#ffffff", "#8fe3d0"];

/* ---------- QUESTIONS ---------- */
const gameData = [
  {
    category: "Mathematics",
    clues: [
      { value: 100, question: "What is the next prime number after 13?", answer: "17" },
      { value: 200, question: "What is the name of a polygon with 9 sides?", answer: "A nonagon" },
      { value: 300, question: "Between 3:00 PM and 5:00 PM, how many degrees does the hour hand move?", answer: "60 degrees" },
      { value: 400, question: "What is 5 factorial (5!)?", answer: "120" },
      { value: 500, question: "What are the first five digits after the decimal point in Pi (π)?", answer: "3.14159" }
    ]
  },
  {
    category: "Sciences",
    clues: [
      { value: 100, question: "What gas do plants absorb from the air for photosynthesis?", answer: "Carbon dioxide" },
      { value: 200, question: "What is the hardest natural substance on Earth?", answer: "Diamond" },
      { value: 300, question: "How many bones are in the adult human body?", answer: "206" },
      { value: 400, question: "How many elements are on the periodic table?", answer: "118" },
      { value: 500, question: "What is the closest star to Earth after the Sun?", answer: "Proxima Centauri" }
    ]
  },
  {
    category: "Languages",
    clues: [
      { value: 100, question: 'Which language is this phrase from: "Делать из мухи слона"?', answer: "Russian" },
      { value: 200, question: 'Which language is this phrase from: "Ich verstehe nur Bahnhof"?', answer: "German" },
      { value: 300, question: 'Which language is this phrase from: "Kamusta ka, kumusta ang araw mo?"', answer: "Tagalog" },
      { value: 400, question: 'Which language is this phrase from: "สวัสดี วันนี้คุณเป็นอย่างไรบ้าง?"', answer: "Thai" },
      { value: 500, question: 'Which language is this phrase from: "Bună, ce mai faci astăzi?"', answer: "Romanian" }
    ]
  },
  {
    category: "Geography",
    clues: [
      { value: 100, question: "Which festival in India is known as the Festival of Lights?", answer: "Diwali" },
      { value: 200, question: "Which body of water is actually a lake and is the saltiest of its kind on Earth?", answer: "The Dead Sea" },
      { value: 300, question: "Which African river crosses the equator twice?", answer: "The Congo River" },
      { value: 400, question: "Which three countries make up Scandinavia?", answer: "Norway, Sweden, and Denmark" },
      { value: 500, question: "Name five countries that border Germany.", answer: "Any five of: Netherlands, Belgium, Luxembourg, France, Switzerland, Austria, Czechia, Poland, Denmark" }
    ]
  },
  {
    category: "AI",
    clues: [
      { value: 100, question: "Which company developed the Gemini family of AI models?", answer: "Google" },
      { value: 200, question: "What is the name of the test proposed by Alan Turing in 1950 to judge whether a machine can think like a human?", answer: "The Turing Test" },
      { value: 300, question: "What does GPT stand for in ChatGPT?", answer: "Generative Pre-trained Transformer" },
      { value: 400, question: "Which Google DeepMind program defeated Go champion Lee Sedol in 2016?", answer: "AlphaGo" },
      { value: 500, question: "Who is known as the \"Father of AI\"?", answer: "John McCarthy" }
    ]
  },
  {
    category: "General Knowledge",
    clues: [
      { value: 100, question: "Which zodiac sign is symbolised by a pair of scales?", answer: "Libra" },
      { value: 200, question: "How many strings does a standard guitar have?", answer: "6" },
      { value: 300, question: "What is the smallest country in the world by area?", answer: "Vatican City" },
      { value: 400, question: "Which language has the most native speakers in the world?", answer: "Mandarin Chinese" },
      { value: 500, question: "Which is the only country in the world whose national flag is not a rectangle or square?", answer: "Nepal" }
    ]
  },
  {
    category: "Gaming",
    clues: [
      { value: 100, question: "Which yellow, dot-eating character stars in a classic 1980 arcade game?", answer: "Pac-Man" },
      { value: 200, question: "What is the best-selling video game of all time, with over 300 million copies sold?", answer: "Minecraft" },
      { value: 300, question: "In Mario Kart, which colour of shell hunts down the player in first place?", answer: "The blue shell (Spiny Shell)" },
      { value: 400, question: "The \"Summoner's Cup\" is awarded to the winners of the world championship of which esports game?", answer: "League of Legends" },
      { value: 500, question: "In 2019, an AI called OpenAI Five beat the reigning world champions, OG, at which esports game?", answer: "Dota 2" }
    ]
  }
];

/*
  =========================================================
  APP STATE
  ---------------------------------------------------------
    - teams:        [{ id, name, score, color }]
    - setupNames:   the names typed on the setup screen
    - selectedClue: the clue open in the popup
    - phase:        "pick" -> "judge" -> "resolved" (popup steps)

  Each clue also gets these fields while playing:
    - used:      true once the question is finished
    - attempted: ids of teams that already got it wrong
    - winnerId:  the team that got the points (null if nobody)
  =========================================================
*/
let teams = [];
let setupNames = Array(MIN_TEAMS).fill("");
let selectedClue = null;
let phase = "pick";
let activeTeamId = null;
let answerShown = false;
let resultText = "";
let resultKind = "";
let timerIntervalId = null;   // running countdown (null = no timer running)
let timerEndsAt = 0;

/* ---------- Page elements ---------- */
const $ = (id) => document.getElementById(id);

const setupScreen = $("setupScreen");
const gameScreen = $("gameScreen");
const finalScreen = $("finalScreen");

const teamForm = $("teamForm");
const teamInputsElement = $("teamInputs");
const addTeamBtn = $("addTeamBtn");
const setupHintElement = $("setupHint");

const boardElement = $("board");
const scoreboardElement = $("scoreboard");
const statusTextElement = $("statusText");
const resetGameBtn = $("resetGameBtn");
const showResultsBtn = $("showResultsBtn");

const modalElement = $("questionModal");
const modalPanelElement = modalElement.querySelector(".modal-panel");
const modalCategoryElement = $("modalCategory");
const modalTitleElement = $("modalTitle");
const modalQuestionElement = $("modalQuestion");
const modalAnswerElement = $("modalAnswer");
const teamPickBox = $("teamPickBox");
const teamPickLabel = $("teamPickLabel");
const teamPickButtons = $("teamPickButtons");
const judgeBox = $("judgeBox");
const answeringTeamElement = $("answeringTeam");
const answerBoxElement = $("answerBox");
const resultMessageElement = $("resultMessage");

/* ---------- Question timer (built here so no HTML/CSS edits are needed) ---------- */
const timerStyle = document.createElement("style");
timerStyle.textContent = `
  .question-timer { margin: 0.9rem auto 0; width: min(100%, 420px); text-align: center; }
  .question-timer .timer-label { font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8; }
  .question-timer .timer-digits { font-size: clamp(2.4rem, 6vw, 3.6rem); font-weight: 800; line-height: 1.1;
    color: var(--gw-yellow, #ffda4b); font-variant-numeric: tabular-nums; }
  .question-timer .timer-bar { height: 10px; border-radius: 999px; background: rgba(255, 255, 255, 0.18); overflow: hidden; }
  .question-timer .timer-bar > span { display: block; height: 100%; width: 100%; border-radius: 999px;
    background: linear-gradient(90deg, #ff7230, #ffda4b); transition: width 0.25s linear; }
  .question-timer.urgent .timer-digits { color: #ff5a64; animation: timerPulse 0.8s ease-in-out infinite; }
  .question-timer.urgent .timer-bar > span { background: #ff5a64; }
  @keyframes timerPulse { 50% { transform: scale(1.12); } }
  @media (prefers-reduced-motion: reduce) { .question-timer.urgent .timer-digits { animation: none; } }
`;
document.head.appendChild(timerStyle);

const timerElement = document.createElement("div");
timerElement.className = "question-timer hidden";
timerElement.setAttribute("role", "timer");
timerElement.innerHTML =
  '<div class="timer-label">Time left</div><div class="timer-digits">1:00</div><div class="timer-bar"><span></span></div>';
judgeBox.appendChild(timerElement);
const timerDigitsElement = timerElement.querySelector(".timer-digits");
const timerBarElement = timerElement.querySelector(".timer-bar > span");

const correctBtn = $("correctBtn");
const incorrectBtn = $("incorrectBtn");
const toggleAnswerBtn = $("toggleAnswerBtn");
const changeTeamBtn = $("changeTeamBtn");
const skipBtn = $("skipBtn");
const doneBtn = $("doneBtn");
const closeModalBtn = $("closeModalBtn");

const podiumElement = $("podium");
const winnerTextElement = $("winnerText");
const confettiElement = $("confetti");
const playAgainBtn = $("playAgainBtn");
const newTeamsBtn = $("newTeamsBtn");

/* ---------- Small helpers ---------- */
function showScreen(name) {
  setupScreen.classList.toggle("hidden", name !== "setup");
  gameScreen.classList.toggle("hidden", name !== "game");
  finalScreen.classList.toggle("hidden", name !== "final");
  window.scrollTo(0, 0);
}

function getTeam(id) {
  return teams.find((team) => team.id === id) || null;
}

function setStatus(text) {
  statusTextElement.textContent = text;
}

function allCluesUsed() {
  return gameData.every((category) => category.clues.every((clue) => clue.used));
}

function countUnusedClues() {
  return gameData.reduce(
    (total, category) => total + category.clues.filter((clue) => !clue.used).length,
    0
  );
}

function clearClueState() {
  gameData.forEach((category) => {
    category.clues.forEach((clue) => {
      clue.used = false;
      clue.attempted = [];
      clue.winnerId = null;
      clue.lastTimedOut = false;
    });
  });
}

/*
  =========================================================
  SETUP SCREEN (team names)
  =========================================================
*/
function renderTeamInputs() {
  teamInputsElement.innerHTML = "";

  setupNames.forEach((name, index) => {
    const row = document.createElement("li");
    row.className = "team-row";

    const swatch = document.createElement("span");
    swatch.className = "team-swatch";
    swatch.style.setProperty("--team-color", TEAM_COLORS[index % TEAM_COLORS.length]);

    const input = document.createElement("input");
    input.type = "text";
    input.className = "team-input";
    input.maxLength = 24;
    input.placeholder = `Team ${index + 1}`;
    input.value = name;
    input.dir = "auto"; // works for Arabic team names too
    input.autocomplete = "off";
    input.setAttribute("aria-label", `Team ${index + 1} name`);
    input.addEventListener("input", () => {
      setupNames[index] = input.value;
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "icon-button remove-team-btn";
    removeBtn.textContent = "✕";
    removeBtn.setAttribute("aria-label", `Remove team ${index + 1}`);
    removeBtn.disabled = setupNames.length <= MIN_TEAMS;
    removeBtn.addEventListener("click", () => {
      setupNames.splice(index, 1);
      renderTeamInputs();
    });

    row.append(swatch, input, removeBtn);
    teamInputsElement.appendChild(row);
  });

  addTeamBtn.disabled = setupNames.length >= MAX_TEAMS;
  addTeamBtn.textContent = `+ Add Team (${setupNames.length}/${MAX_TEAMS})`;
  setupHintElement.textContent =
    `Enter your team names (${MIN_TEAMS} to ${MAX_TEAMS} teams). Leave a name empty to use "Team 1", "Team 2"...`;
}

function addTeamRow() {
  if (setupNames.length >= MAX_TEAMS) return;
  setupNames.push("");
  renderTeamInputs();
  const inputs = teamInputsElement.querySelectorAll(".team-input");
  inputs[inputs.length - 1].focus();
}

// Trim names, fill blanks with "Team N", and make duplicates unique
function buildTeamNames(rawNames) {
  const taken = new Set();
  return rawNames.map((raw, index) => {
    const base = raw.trim() || `Team ${index + 1}`;
    let name = base;
    let counter = 2;
    while (taken.has(name.toLowerCase())) {
      name = `${base} (${counter++})`;
    }
    taken.add(name.toLowerCase());
    return name;
  });
}

function goToSetup(names) {
  closeModalSilently();
  setupNames = names && names.length >= MIN_TEAMS ? names.slice() : Array(MIN_TEAMS).fill("");
  renderTeamInputs();
  showScreen("setup");
}

/*
  =========================================================
  START / RESET A GAME
  =========================================================
*/
function startGame(names) {
  teams = names.map((name, index) => ({
    id: index,
    name,
    score: 0,
    color: TEAM_COLORS[index % TEAM_COLORS.length]
  }));

  clearClueState();
  selectedClue = null;

  boardElement.style.setProperty("--columns", gameData.length);
  renderScoreboard();
  renderBoard();
  setStatus("Pick a tile to start the game.");
  showScreen("game");
}

/*
  =========================================================
  SCOREBOARD (one card per team)
  =========================================================
*/
function renderScoreboard(bumpTeamId = null) {
  scoreboardElement.innerHTML = "";

  teams.forEach((team) => {
    const card = document.createElement("div");
    card.className = "team-card";
    card.style.setProperty("--team-color", team.color);

    const name = document.createElement("span");
    name.className = "team-name";
    name.dir = "auto";
    name.textContent = team.name;
    name.title = team.name;

    const score = document.createElement("span");
    score.className = "team-score";
    score.textContent = team.score;
    if (team.id === bumpTeamId) score.classList.add("bump");

    card.append(name, score);
    scoreboardElement.appendChild(card);
  });

  // Lots of teams? Use smaller cards so the board still fits on screen
  scoreboardElement.classList.toggle("compact", teams.length > COMPACT_SCOREBOARD_FROM);
}

/*
  The board's tile height depends on how tall the scoreboard is
  (30 teams take more rows than 3). Tell the CSS the scoreboard's
  real height whenever it changes.
*/
if (typeof ResizeObserver !== "undefined") {
  new ResizeObserver(() => {
    const height = scoreboardElement.offsetHeight;
    if (height > 0) {
      document.documentElement.style.setProperty("--scoreboard-h", `${height}px`);
    }
  }).observe(scoreboardElement);
}

/*
  =========================================================
  BOARD RENDERING
  ---------------------------------------------------------
  Category headers first, then one row of tiles per value.
  =========================================================
*/
function renderBoard() {
  boardElement.innerHTML = "";

  gameData.forEach((categoryData) => {
    const categoryCard = document.createElement("div");
    categoryCard.className = "category-card";
    categoryCard.textContent = categoryData.category;
    boardElement.appendChild(categoryCard);
  });

  const numberOfRows = gameData[0].clues.length;

  for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
    gameData.forEach((categoryData, categoryIndex) => {
      const clueData = categoryData.clues[rowIndex];

      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "clue-tile";

      const value = document.createElement("span");
      value.className = "tile-value";
      value.textContent = clueData.value;
      tile.appendChild(value);

      if (clueData.used) {
        tile.disabled = true;
        tile.classList.add("used");

        // Show who won the tile (or a dash if nobody did)
        const winner = getTeam(clueData.winnerId);
        const winnerLabel = document.createElement("span");
        winnerLabel.className = "tile-winner";
        winnerLabel.dir = "auto";
        winnerLabel.textContent = winner ? winner.name : "—";
        if (winner) winnerLabel.style.setProperty("--team-color", winner.color);
        tile.appendChild(winnerLabel);
        tile.setAttribute("aria-label",
          `${categoryData.category} ${clueData.value} points, done${winner ? ", won by " + winner.name : ""}`);
      } else {
        tile.setAttribute("aria-label", `${categoryData.category} ${clueData.value} points`);
        tile.addEventListener("click", () => openClue(categoryIndex, rowIndex));
      }

      boardElement.appendChild(tile);
    });
  }
}

/*
  =========================================================
  QUESTION POPUP
  ---------------------------------------------------------
  phase "pick"     -> ask which team is answering
  phase "judge"    -> host marks Correct / Incorrect
  phase "resolved" -> show the answer and the result
  =========================================================
*/
function openClue(categoryIndex, rowIndex) {
  const clueData = gameData[categoryIndex].clues[rowIndex];
  if (clueData.used) return;

  selectedClue = { categoryIndex, rowIndex, data: clueData };
  phase = "pick";
  activeTeamId = null;
  answerShown = false;
  resultText = "";
  resultKind = "";

  modalElement.classList.remove("hidden");
  modalElement.setAttribute("aria-hidden", "false");
  renderModal();

  setStatus(`${gameData[categoryIndex].category} for ${clueData.value}. Which team is answering?`);
}

function renderModal() {
  if (!selectedClue) return;

  const clue = selectedClue.data;
  const category = gameData[selectedClue.categoryIndex];

  modalCategoryElement.textContent = category.category;
  modalTitleElement.textContent = `${clue.value} pts`;
  modalQuestionElement.textContent = clue.question;
  modalAnswerElement.textContent = clue.answer;

  // Hide everything, then show only what this phase needs
  [teamPickBox, judgeBox, answerBoxElement, resultMessageElement,
   correctBtn, incorrectBtn, toggleAnswerBtn, changeTeamBtn, skipBtn, doneBtn]
    .forEach((element) => element.classList.add("hidden"));

  if (phase === "pick") {
    renderTeamPickButtons(clue);
    teamPickBox.classList.remove("hidden");
    skipBtn.classList.remove("hidden");
    focusFirstEnabled(teamPickButtons);
  }

  if (phase === "judge") {
    const team = getTeam(activeTeamId);
    answeringTeamElement.textContent = team ? team.name : "";
    answeringTeamElement.style.setProperty("--team-color", team ? team.color : "#fff");
    judgeBox.classList.remove("hidden");

    answerBoxElement.classList.toggle("hidden", !answerShown);
    toggleAnswerBtn.textContent = answerShown ? "Hide Answer" : "Show Answer";

    correctBtn.classList.remove("hidden");
    incorrectBtn.classList.remove("hidden");
    toggleAnswerBtn.classList.remove("hidden");
    changeTeamBtn.classList.remove("hidden");
    correctBtn.focus();
  }

  if (phase === "resolved") {
    answerBoxElement.classList.remove("hidden");

    resultMessageElement.textContent = resultText;
    resultMessageElement.className = `result-message ${resultKind}`;

    // If this was the very last question, the button leads to the leaderboard
    doneBtn.textContent = countUnusedClues() === 0 ? "See Final Results" : "Back to Board";
    doneBtn.classList.remove("hidden");
    doneBtn.focus();
  }
}

// Step 1: buttons for each team (teams that already missed this question are disabled)
function renderTeamPickButtons(clue) {
  teamPickButtons.innerHTML = "";

  if (clue.attempted.length > 0) {
    const lastMiss = getTeam(clue.attempted[clue.attempted.length - 1]);
    const who = lastMiss ? lastMiss.name : "That team";
    teamPickLabel.textContent = clue.lastTimedOut
      ? `Time's up for ${who}! Which team wants to try next? (no timer)`
      : `${who} missed it. Which team wants to try next?`;
  } else {
    teamPickLabel.textContent = "Which team is answering?";
  }

  teams.forEach((team) => {
    const alreadyTried = clue.attempted.includes(team.id);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "team-pick-btn";
    button.style.setProperty("--team-color", team.color);
    button.disabled = alreadyTried;
    button.dir = "auto";
    button.textContent = team.name;

    if (alreadyTried) {
      const note = document.createElement("small");
      note.textContent = "tried";
      button.appendChild(note);
    } else {
      button.addEventListener("click", () => chooseTeam(team.id));
    }

    teamPickButtons.appendChild(button);
  });
}

function focusFirstEnabled(container) {
  const first = container.querySelector("button:not(:disabled)");
  if (first) first.focus();
}

/*
  =========================================================
  QUESTION TIMER
  ---------------------------------------------------------
  Only the first team on a question is timed. When the time
  runs out, the question goes back to "pick a team" and the
  next teams answer without a timer.
  =========================================================
*/
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  const msLeft = Math.max(0, timerEndsAt - Date.now());
  const secondsLeft = Math.ceil(msLeft / 1000);
  timerDigitsElement.textContent = formatTime(secondsLeft);
  timerBarElement.style.width = `${(msLeft / (QUESTION_TIME_SECONDS * 1000)) * 100}%`;
  timerElement.classList.toggle("urgent", secondsLeft <= 10);
  return msLeft;
}

function stopTimer() {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  timerElement.classList.add("hidden");
  timerElement.classList.remove("urgent");
}

function startTimer() {
  stopTimer();
  if (QUESTION_TIME_SECONDS <= 0) return;
  timerEndsAt = Date.now() + QUESTION_TIME_SECONDS * 1000;
  timerElement.classList.remove("hidden");
  updateTimerDisplay();
  timerIntervalId = setInterval(() => {
    if (updateTimerDisplay() <= 0) timeUp();
  }, 200);
}

function playTimeUpSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = 440;
    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.7);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.7);
  } catch (error) {
    /* sound is optional */
  }
}

/* Time ran out on the first team: pass the question on (no points lost) */
function timeUp() {
  stopTimer();
  if (!selectedClue || phase !== "judge") return;

  const clue = selectedClue.data;
  const team = getTeam(activeTeamId);
  if (!team || clue.used) return;

  playTimeUpSound();
  clue.attempted.push(team.id);
  clue.lastTimedOut = true;

  activeTeamId = null;
  answerShown = false;

  if (clue.attempted.length >= teams.length) {
    clue.used = true;
    clue.winnerId = null;
    resultText = "Time's up, and no other team is left. No points this time.";
    resultKind = "miss";
    phase = "resolved";
    setStatus("Nobody got that one. Pick the next tile.");
  } else {
    phase = "pick";
    setStatus(`Time's up for ${team.name}! Which team wants to try next?`);
  }

  renderModal();
}

/* Step 1 -> 2: a team was chosen */
function chooseTeam(teamId) {
  activeTeamId = teamId;
  answerShown = false;
  phase = "judge";

  // Only the first team to try this question is timed
  if (selectedClue.data.attempted.length === 0) {
    startTimer();
  } else {
    stopTimer();
  }
  renderModal();
}

/* Go back to picking a team (e.g. wrong team clicked by mistake) */
function changeTeam() {
  stopTimer();
  activeTeamId = null;
  answerShown = false;
  phase = "pick";
  renderModal();
}

/* The host can peek at the answer while judging */
function toggleAnswer() {
  answerShown = !answerShown;
  renderModal();
  toggleAnswerBtn.focus();
}

/*
  =========================================================
  SCORING
  ---------------------------------------------------------
  Correct   -> this team gets the points, question is finished
  Incorrect -> next team gets a chance (answer stays hidden).
               If every team missed it, the question ends.
  =========================================================
*/
function markCorrect() {
  if (!selectedClue || phase !== "judge") return;
  stopTimer();

  const clue = selectedClue.data;
  const team = getTeam(activeTeamId);
  if (!team || clue.used) return;

  team.score += clue.value;
  clue.used = true;
  clue.winnerId = team.id;

  resultText = `${team.name} got it! +${clue.value} points`;
  resultKind = "win";
  phase = "resolved";
  setStatus(`${team.name} scored ${clue.value}. Pick the next tile.`);

  renderScoreboard(team.id);
  renderModal();
}

function markIncorrect() {
  if (!selectedClue || phase !== "judge") return;
  stopTimer();

  const clue = selectedClue.data;
  const team = getTeam(activeTeamId);
  if (!team || clue.used) return;

  clue.attempted.push(team.id);
  clue.lastTimedOut = false;

  if (POINTS_LOST_ON_WRONG) {
    team.score -= clue.value;
    renderScoreboard(team.id);
  }

  activeTeamId = null;
  answerShown = false;

  if (clue.attempted.length >= teams.length) {
    // Every team has tried and missed
    clue.used = true;
    clue.winnerId = null;
    resultText = "No team got it. No points this time.";
    resultKind = "miss";
    phase = "resolved";
    setStatus("Nobody got that one. Pick the next tile.");
  } else {
    phase = "pick";
    setStatus(`${team.name} missed it. Which team wants to try next?`);
  }

  renderModal();
}

/* Nobody wants to answer: close the question without points */
function skipClue() {
  if (!selectedClue || phase !== "pick") return;

  const clue = selectedClue.data;
  clue.used = true;
  clue.winnerId = null;

  resultText = "Skipped. No points awarded.";
  resultKind = "miss";
  phase = "resolved";
  setStatus("Question skipped. Pick the next tile.");
  renderModal();
}

/*
  =========================================================
  CLOSE THE POPUP
  ---------------------------------------------------------
  Closing mid-question keeps the tile open for later and
  remembers which teams already missed it.
  =========================================================
*/
function closeModalSilently() {
  stopTimer();
  modalElement.classList.add("hidden");
  modalElement.setAttribute("aria-hidden", "true");
  selectedClue = null;
  activeTeamId = null;
  answerShown = false;
}

function closeModal() {
  if (!selectedClue) return;

  const wasFinished = selectedClue.data.used;
  closeModalSilently();

  renderBoard();
  renderScoreboard();

  if (allCluesUsed()) {
    showFinal();
  } else if (!wasFinished) {
    setStatus("Closed the question window. Pick a tile.");
  }
}

/*
  =========================================================
  FINAL LEADERBOARD (top 3)
  ---------------------------------------------------------
  Teams with the same score share a rank (and a podium step).
  =========================================================
*/
function getRankedTeams() {
  const sorted = teams.slice().sort((a, b) => b.score - a.score || a.id - b.id);
  let rank = 0;
  let previousScore = null;

  return sorted.map((team, index) => {
    if (team.score !== previousScore) {
      rank = index + 1;
      previousScore = team.score;
    }
    return { team, rank };
  });
}

function showFinal() {
  closeModalSilently();
  renderPodium();
  launchConfetti();
  showScreen("final");
}

function renderPodium() {
  const ranked = getRankedTeams();
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const ordinals = { 1: "1st", 2: "2nd", 3: "3rd" };

  // Group teams by rank, keeping only ranks 1 to 3
  const groups = {};
  ranked.forEach(({ team, rank }) => {
    if (rank <= 3) {
      (groups[rank] = groups[rank] || []).push(team);
    }
  });

  // Winner text
  const winners = groups[1] || [];
  if (winners.length === 1) {
    winnerTextElement.textContent = `Congratulations, ${winners[0].name}!`;
  } else if (winners.length <= 4) {
    winnerTextElement.textContent =
      `It's a tie! Congratulations, ${winners.map((team) => team.name).join(" & ")}!`;
  } else {
    winnerTextElement.textContent = `It's a ${winners.length}-way tie for 1st place!`;
  }

  // Classic podium order: 2nd - 1st - 3rd
  podiumElement.innerHTML = "";
  [2, 1, 3].forEach((rank) => {
    const group = groups[rank];
    if (!group) return;

    const step = document.createElement("div");
    step.className = `podium-step rank-${rank}`;

    const info = document.createElement("div");
    info.className = "podium-info";

    const medal = document.createElement("div");
    medal.className = "podium-medal";
    medal.textContent = medals[rank];
    info.appendChild(medal);

    // Several teams on the same step: show their names side by side, smaller
    const names = document.createElement("div");
    names.className = "podium-names";
    if (group.length > 3) names.classList.add("many");

    group.forEach((team) => {
      const name = document.createElement("div");
      name.className = "podium-name";
      name.dir = "auto";
      name.textContent = team.name;
      names.appendChild(name);
    });
    info.appendChild(names);

    const points = document.createElement("div");
    points.className = "podium-points";
    points.textContent = `${group[0].score} pts`;
    info.appendChild(points);

    const block = document.createElement("div");
    block.className = "podium-block";
    block.textContent = ordinals[rank];

    step.append(info, block);
    podiumElement.appendChild(step);
  });
}

function launchConfetti() {
  confettiElement.innerHTML = "";
  const colors = ["#ff7230", "#ffda4b", "#ffffff", "#d77db0", "#69afd8", "#b5232e"];

  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 3}s`;
    piece.style.animationDuration = `${3 + Math.random() * 3}s`;
    confettiElement.appendChild(piece);
  }
}

/*
  =========================================================
  EVENT LISTENERS
  =========================================================
*/
teamForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startGame(buildTeamNames(setupNames));
});
addTeamBtn.addEventListener("click", addTeamRow);

correctBtn.addEventListener("click", markCorrect);
incorrectBtn.addEventListener("click", markIncorrect);
toggleAnswerBtn.addEventListener("click", toggleAnswer);
changeTeamBtn.addEventListener("click", changeTeam);
skipBtn.addEventListener("click", skipClue);
doneBtn.addEventListener("click", closeModal);
closeModalBtn.addEventListener("click", closeModal);

resetGameBtn.addEventListener("click", () => {
  if (window.confirm("Reset the game? All scores and used questions will be cleared and you'll go back to team setup.")) {
    goToSetup(teams.map((team) => team.name));
  }
});

showResultsBtn.addEventListener("click", () => {
  if (window.confirm("End the game now and show the leaderboard?")) {
    showFinal();
  }
});

playAgainBtn.addEventListener("click", () => startGame(teams.map((team) => team.name)));
newTeamsBtn.addEventListener("click", () => goToSetup(null));

// Escape closes the popup; clicking the dark backdrop does too
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalElement.classList.contains("hidden")) {
    closeModal();
  }
});

modalElement.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal-backdrop")) {
    closeModal();
  }
});

/*
  =========================================================
  INITIALIZE THE APP
  =========================================================
*/
clearClueState();
renderTeamInputs();
showScreen("setup");