var canvas;
var canvasContext;
var gameInterval;

//ball coordinates
var ballX = 50;
var ballY = 10;

//ball speed in x and y directions,
var ballSpeedX = 20;
var ballSpeedY = 4;
var ballSpeedXDefault = 20;
var ballSpeedYDefault = 4;
var ballSize = 10;
var ballColor = "red";

//player scores
var player1Score = 0;
var player2Score = 0;
var WINNING_SCORE = 5;

//show win screen
var showingWinScreen = false;

// paddle positions
var paddle1Y = 250;
var paddle2Y = 250;

//defines paddle height, change to make paddle bigger or smaller
var PADDLE_HEIGHT = 100;
var PADDLE_WIDTH = 10;

//returns mouse coordiates within the canvas boundaries
function calculateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  var mouseX = evt.clientX - rect.left - root.scrollLeft;
  var mouseY = evt.clientY - rect.top - root.scrollTop;
  return {
    x: mouseX,
    y: mouseY,
  };
}

function handleMouseClick(evt) {
  if (showingWinScreen) {
    player1Score = 0;
    player2Score = 0;
    showingWinScreen = false;
  }
}

// listener for start button
document.getElementById("start").addEventListener("click", () => {
  document.getElementById("into").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  document.getElementById("ui").style.display = "block";
  this.startGame();
});

// listener for end button
document.getElementById("end").addEventListener("click", () => {
  clearInterval(gameInterval);
  ballReset();
  document.getElementById("into").style.display = "block";
  document.getElementById("gameCanvas").style.display = "none";
  document.getElementById("ui").style.display = "none";
});

// listener for settings button
document.getElementById("settings").addEventListener("click", () => {
  updateSettingsForm();
  document.getElementById("settings-box").style.display = "block";
  document.getElementById("into").style.display = "none";
});

// listener for save-settings button
document.getElementById("save-settings").addEventListener("click", () => {
  updateGameSettings();
  document.getElementById("settings-box").style.display = "none";
  document.getElementById("into").style.display = "block";
});

// map existing game settings to settings page
function updateSettingsForm() {
  document.querySelectorAll(".setting-value").forEach((item) => {
    switch (item.dataset["setting"]) {
      case "ball-speed-x":
        item.value = ballSpeedXDefault;
        break;
      case "ball-speed-y":
        item.value = ballSpeedYDefault;
        break;
      case "ball-size":
        item.value = ballSize;
        break;
      case "ball-color":
        item.value = ballColor;
        break;
      case "paddle-size-x":
        item.value = PADDLE_HEIGHT;
        break;
      case "paddle-size-y":
        item.value = PADDLE_WIDTH;
        break;
      case "winning-score":
        item.value = WINNING_SCORE;
        break;
    }
  });
}

// map from data to game settings
function updateGameSettings() {
  document.querySelectorAll(".setting-value").forEach((item) => {
    switch (item.dataset["setting"]) {
      case "ball-speed-x":
        ballSpeedX = parseInt(item.value);
        ballSpeedXDefault = parseInt(item.value);
        break;
      case "ball-speed-y":
        ballSpeedY = parseInt(item.value);
        ballSpeedYDefault = parseInt(item.value);
        break;
      case "ball-size":
        ballSize = parseInt(item.value);
        break;
      case "ball-color":
        ballColor = item.value;
        break;
      case "paddle-size-x":
        PADDLE_HEIGHT = parseInt(item.value);
        break;
      case "paddle-size-y":
        PADDLE_WIDTH = parseInt(item.value);
        break;
      case "winning-score":
        WINNING_SCORE = parseInt(item.value);
        break;
    }
  });
}

// begin game
function startGame() {
  canvas = document.getElementById("gameCanvas");
  canvasContext = canvas.getContext("2d");
  var framesPerSecond = 30;
  gameInterval = setInterval(function () {
    moveEverything();
    drawEverything();
  }, 1000 / framesPerSecond);

  canvas.addEventListener("mousemove", function (evt) {
    var mousePos = calculateMousePos(evt);
    paddle1Y = mousePos.y - PADDLE_HEIGHT / 2;
  });

  canvas.addEventListener("mousedown", handleMouseClick);
}

// reset ball every time someone scores a point
function ballReset() {
  //if someone reaches the winning score
  if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
    showingWinScreen = true;
  }
  ballSpeedX = -ballSpeedX;
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
}

//moves computer-controlled right paddle to catch ball
function computerMovement() {
  var paddle2YCenter = paddle2Y + PADDLE_HEIGHT / 2;
  if (paddle2YCenter < ballY - 6) {
    paddle2Y += 6;
  } else if (paddle2YCenter > ballY + 6) {
    paddle2Y -= 6;
  }
}

//updates position of game elements
function moveEverything() {
  //if win screen is showing, do nothing until player clicks
  if (showingWinScreen) {
    return;
  }
  computerMovement();
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballX >= canvas.width) {
    if (ballY > paddle2Y && ballY < paddle2Y + PADDLE_HEIGHT) {
      ballSpeedX = -ballSpeedX;
      //ball will change speed on hitting different parts of player's           paddle
      var deltaY = ballY - (paddle2Y + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * 0.35;
    } else {
      // must be before ballReset
      player1Score++;
      ballReset();
    }
  }

  if (ballX <= PADDLE_WIDTH) {
    if (ballY > paddle1Y && ballY < paddle1Y + PADDLE_HEIGHT) {
      ballSpeedX = -ballSpeedX;
      var deltaY = ballY - (paddle1Y + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * 0.35;
    } else {
      // must be before ballReset
      player2Score++;
      ballReset();
    }
  }

  if (ballY >= canvas.height || ballY <= 0) {
    ballSpeedY = -ballSpeedY;
  }
}

//draws net down the middle of the screen
function drawNet() {
  for (var i = 0; i < canvas.height; i += 40) {
    colorRect(canvas.width / 2 - 1, i, 2, 20, "white");
  }
}

//draws all game ui
function drawEverything() {
  //draw black canvas
  canvasContext.font = "16px 'Press Start 2P'";
  colorRect(0, 0, canvas.width, canvas.height, "black");
  //if win screen is showing, do nothing until player clicks
  if (showingWinScreen) {
    canvasContext.fillStyle = "white";
    if (player1Score >= WINNING_SCORE) {
      canvasContext.fillText("Player Won!", 320, 100);
    } else if (player2Score >= WINNING_SCORE) {
      canvasContext.fillText("Computer Won!", 300, 100);
    }
    canvasContext.fillText("Click to Reset", 300, 500);
    return;
  }
  //draws left paddle
  colorRect(0, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, "white");
  //draws right paddle
  colorRect(
    canvas.width - PADDLE_WIDTH,
    paddle2Y,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    "white"
  );
  //draws ball
  colorCircle(ballX, ballY, ballSize, ballColor);
  //draw net
  drawNet();
  // score display
  canvasContext.fillStyle = "white";
  canvasContext.fillText(player1Score, 100, 100);
  canvasContext.fillText(player2Score, canvas.width - 100, 100);
}

//draws a rectangle
function colorRect(leftX, topY, width, height, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX, topY, width, height);
}

//draws a circle
function colorCircle(centreX, centreY, radius, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.beginPath();
  canvasContext.arc(centreX, centreY, radius, 0, Math.PI * 2, true);
  canvasContext.fill();
}
