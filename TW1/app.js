/**
 * Game
 * Settings
 */

const api = "https://opentdb.com/api.php";
const pointsPerAnswer = 5;
const timePerAnswer = 15;

/**
 * Global vars
 */

var clock = null;
var settings = null;
var currentQuestion = null;
var userStatus = {
  score: 0,
  time: timePerAnswer,
};

/**
 * Proxy used for interception of userStatus update
 */
var userStatusProxy = new Proxy(userStatus, {
  set: (target, prop, value) => {
    target[prop] = value;
    document.querySelector("#game-" + prop).innerHTML = value;
    return true;
  },
});

/**
 * Init default settings of game
 */
function loadDefaultSettings() {
  settings = {
    time: 10,
    category: "any",
    music: true,
    volume: 5,
    difficulty: "any",
  };

  saveCurrentSettings();
  userStatus.time = settings.time;
}

/**
 * Load users settings from browser storage
 */
function loadUserSettings() {
  const storedSettings = localStorage.getItem("settings");

  if (storedSettings) {
    settings = JSON.parse(localStorage.getItem("settings"));
  } else {
    loadDefaultSettings();
  }

  let settingsForm = document.forms["settings"];
  settingsForm.elements[0].checked = settings.music;
  settingsForm.elements[1].value = settings.category;
  settingsForm.elements[2].value = settings.difficulty;
  settingsForm.elements[3].value = settings.volume;
  settingsForm.elements[4].value = settings.time;
  updatePlayer();
  updateSlidersValues();
}

/**
 * Save settings changes maded by user
 */
function saveCurrentSettings() {
  updateSlidersValues();
  updatePlayer();
  localStorage.setItem("settings", JSON.stringify(settings));
}

/**
 * Handle background ambiend music
 */
function updatePlayer() {
  let player = document.getElementById("music-player");
  player.volume = settings.volume / 10;
  settings.music ? player.play() : player.pause();
}

/**
 * Modals
 * interactions
 */

/** Settings modal */
const settingsModal = document.getElementById("settingModal");

/**
 * Listener to open modal
 */
document.querySelector("#settings").addEventListener("click", () => {
  loadUserSettings();
  settingsModal.style.display = "block";
});

/**
 * Handle settings form
 */
document.querySelector("form[name=settings").addEventListener("submit", (e) => {
  e.preventDefault();
  settingsModal.style.display = "none";
  settings = {
    music: e.target[0].checked,
    category: e.target[1].value,
    difficulty: e.target[2].value,
    volume: parseInt(e.target[3].value),
    time: parseInt(e.target[4].value),
  };
  saveCurrentSettings();
});

/**
 * Listener to close modal
 */
document.querySelectorAll(".settings-close").forEach((item) => {
  item.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });
});

/**
 * Handle music settings
 */
document
  .querySelector("#setting-music-volume")
  .addEventListener("change", (e) => {
    document.querySelector("#setting-music-volume-value").innerHTML =
      e.target.value + "0%";
  });

/**
 * Handle time settings
 */
document.querySelector("#setting-time").addEventListener("change", (e) => {
  document.querySelector("#setting-time-value").innerHTML =
    e.target.value + "s";
});

/**
 * Handle update of settings form with current user settings.
 * Used when user load settings from local storage or when close modal without saving
 */
function updateSlidersValues() {
  document.querySelector("#setting-time-value").innerHTML = settings.time + "s";
  document.querySelector("#setting-music-volume-value").innerHTML =
    settings.volume + "0%";
}

/** About modal */
const aboutModal = document.getElementById("aboutModal");

/**
 * Listener to open modal
 */
document.querySelector("#about").addEventListener("click", () => {
  aboutModal.style.display = "block";
});

/**
 * Listener to close modal
 */
document.querySelectorAll(".about-close").forEach((item) => {
  item.addEventListener("click", () => {
    aboutModal.style.display = "none";
  });
});

// Register modals close when click outside of modal
window.onclick = function (event) {
  const modals = [settingsModal, aboutModal];
  modals.forEach((el) => {
    if (el == event.target) {
      el.style.display = "none";
    }
  });
};

/**
 * Start
 * Game
 */

/**
 * Listener that handle game mode selection
 */
document.querySelector("#start").addEventListener("click", () => {
  document.querySelector(".menu").style.display = "none";
  document.querySelector(".start-game-selector").style.display = "block";
  document.querySelector("#title").innerHTML = "Select your <br> GameMode";
  document.querySelector("#subtitle").style.display = "none";
});

/**
 * Listener that handle end game button
 */
document.querySelectorAll(".back-menu").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelector(".center-screen").style.display = "flex";
    document.querySelector("#game-container").style.display = "none";
    document.querySelector(".menu").style.display = "block";
    document.querySelector(".start-game-selector").style.display = "none";
    document.querySelector("#title").innerHTML = "KingTrivia";
    document.querySelector("#subtitle").style.display = "block";
    document.querySelector("#subtitle").innerHTML = userStatus.score
      ? "Last score: " + userStatus.score + " ... Can you beat this?"
      : "Do you know everything?";
  });
});

/**
 * Create API url with current game settings
 *
 * @param {string} type Game mode, can be boolean or multiple
 */
function buildApiQuery(type) {
  let base = `${api}?amount=1&type=${type}`;
  if (settings.category !== "any") {
    base += `&category=${settings.category}`;
  }
  if (settings.difficulty !== "any") {
    base += `&difficulty=${settings.difficulty}`;
  }
  return base;
}

/**
 * Handle start game.
 * This listener handle all the game modes buttons
 */
document.querySelectorAll(".start-game").forEach((item) => {
  item.addEventListener("click", (e) => {
    loadingQuestion();
    document.querySelector(".start-game-selector").style.display = "none";
    document.querySelector(".center-screen").style.display = "block";
    document.querySelector("#title").innerHTML = "";
    document.querySelector("#game-container").style.display = "block";
    beginGame(e.target.dataset.type);
  });
});

/**
 * Things that should be executed each time when a new game start
 *
 * @param {string} type Game mode, can be boolean or multiple
 */
function beginGame(type) {
  userStatusProxy.time = settings.time;
  userStatusProxy.score = 0;
  userStatusProxy.mode = type;
  fetchQuestion(type);
}

/**
 * Fetch new question from API
 *
 * @param {string} type Game mode, can be boolean or multiple
 */
function fetchQuestion(type) {
  const url = buildApiQuery(type);
  clearInterval(clock);
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const result = data.results[0];
      currentQuestion = {
        title: result.question,
        correct: result.correct_answer,
        incorrect: result.incorrect_answers,
        mode: type,
      };
      updateAnswers(type);
      document.querySelector("#game-question").innerHTML =
        currentQuestion.title;
      document.querySelector("#game-answers").style.display = "block";

      clock = setInterval(() => {
        userStatusProxy.time -= 1;
        if (userStatus.time == 0) {
          document.querySelector("#game-question").innerHTML =
            "Out of time! </br> Your score " + userStatus.score;

          document.querySelector("#game-answers").style.display = "none";
          setTimeout(() => {
            document.getElementById("game-end").click();
          }, 1500);
          clearInterval(clock);
        }
      }, 1000);
    });
}

/**
 * Shuffle content of array
 * @param {array} array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Render on DOM current answers of question
 */
function updateAnswers() {
  let answers = currentQuestion.incorrect;
  answers.push(currentQuestion.correct);
  answers = shuffleArray(answers);

  answers = answers.map((item) => {
    return `<li class="answer" data-value="${item}">${item}</li>`;
  });

  document.getElementById("game-answers").innerHTML = answers.join(" ");
  prepareAnswersListeners();
}

/**
 * Render loading screen
 */
function loadingQuestion() {
  document.querySelector("#game-question").innerHTML = "Loading...";
  document.querySelector("#game-answers").style.display = "none";
}

/**
 * Add listeners to any existing answers.
 * When any answers is clicked check if it's correct.
 */
function prepareAnswersListeners() {
  document.querySelectorAll(".answer").forEach((item) => {
    item.addEventListener("click", (e) => {
      clearInterval(clock);
      const selectedAnswer = e.target.dataset.value;
      if (selectedAnswer == currentQuestion.correct) {
        userStatusProxy.score += pointsPerAnswer;

        document.querySelector("#game-question").innerHTML =
          "Correct!! +" + pointsPerAnswer + " points";

        document.querySelector("#game-answers").style.display = "none";
        userStatusProxy.time = settings.time;
        setTimeout(() => {
          fetchQuestion(currentQuestion.mode);
        }, 1500);
      } else {
        document.querySelector("#game-question").innerHTML =
          "Wrong answer! </br> Your score " + userStatus.score + " </br> Correct response: " + currentQuestion.correct;

        document.querySelector("#game-answers").style.display = "none";
        setTimeout(() => {
          document.getElementById("game-end").click();
        }, 2500);
      }
    });
  });
}

/**
 * Load saved settings of game saved in browser storage
 */
window.onload = () => {
  loadUserSettings();
};
