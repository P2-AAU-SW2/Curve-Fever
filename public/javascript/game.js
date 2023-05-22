/* global io, players, curPlayer, gameId */
const messageInput = document.getElementById("usermsg");
const form = document.getElementById("form");
const scoretable = document.querySelector("#scoretable");
const canvas = document.getElementById("game-canvas");
const canvasContainer = document.querySelector(".canvas-container");
const ctx = canvas.getContext("2d");
const warmupBtn = document.getElementById("warmup-btn");
// const roundCounter = document.getElementById("roundCounter");
let mode = "warmUp";
let initialCanvasSize, canvasSize;
initialCanvasSize = canvasSize = 960;
let scale = 1;

const socket = io({
    query: {
        gameID: gameId,
        userID: curPlayer.userId,
    },
});

socket.on("connect", () => {
    // console.log(players);
    socket.emit("newPlayer", players);
});

socket.on("chat", (message) => {
    displayMessage(message);
});

socket.on("newPlayer", (player) => {
    displayScoreboard(player);
});

socket.on("leaveGame", (userID) => {
    for (let i in players) {
        if (userID === players[i].userId) {
            players.splice(i, 1);
            rerenderScoretable();
            break;
        }
    }
});

socket.on("updatePosition", (updatedPlayers) => {
    // console.timeEnd("updatePosition");
    updatedPlayers.forEach((updatedPlayer) => {
        let i = players.findIndex((el) => el.userId === updatedPlayer.userId);
        players[i] = updatedPlayer;

        // If the current player collided clear interval
        if (updatedPlayer.userId === curPlayer.userId) {
            if (updatedPlayer.collided) {
                if (mode === "warmUp")
                    warmupBtn.classList.remove("display-none");
            }
        }
        draw(players);
    });
    // console.time("updatePosition");
});

socket.on("countdown", (count) => {
    // console.log(count);
    mode = "game";
    warmupBtn.classList.add("display-none");
    displayCountdown(count);
});
function displayCountdown(i) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bolder 60px Arial";
    ctx.clearRect(0, 0, canvasSize, canvasSize); // Clear the canvas
    ctx.fillText(String(i), canvasSize / 2, canvasSize / 2); // draw countdown on the canvas
}

socket.on("renderScoreTable", (updatedPlayers) => {
    updatedPlayers.forEach((updatedPlayer) => {
        let i = players.findIndex((el) => el.userId === updatedPlayer.userId);
        players[i].leaderboardScore = updatedPlayer.leaderboardScore;
    });
    // Sort leaderboard from highest to lowest
    players.sort((a, b) => b.leaderboardScore - a.leaderboardScore);
    rerenderScoretable();
});

socket.on("gameNotFound", function () {
    window.location.href = "/"; // redirects to home page
});

window.addEventListener("resize", resizeCanvas);
function resizeCanvas() {
    let borderWidth = 6;
    let width = canvasContainer.offsetWidth - borderWidth;
    let height = canvasContainer.offsetHeight - borderWidth;
    let size = width < height ? width : height; // -_-_- What should the max width/height for canvas be? -_-_-
    canvas.width = canvas.height = size;
    scale = size / initialCanvasSize; // scale as a ratio
    canvasSize = size / scale; // ctx methods needs the scaled height/width
    ctx.setTransform(1, 0, 0, 1, 0, 0); // removes any previous transformations
    ctx.scale(scale, scale); // apply the scale factor
    canvasContainer.classList.remove("visibility-hidden");
}
resizeCanvas();

function draw(players) {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    players.forEach((player) => {
        if (player.isMoving) {
            ctx.strokeStyle = player.color;
            ctx.fillStyle = player.color;
            ctx.lineWidth = player.lineWidth;
            ctx.lineCap = "round";
            const radius = player.lineWidth * 0.0933 + 0.1;
            if (player.isFlying || player.path.length === 1)
                drawDot(player, radius * 5);
            else if (player.path.length > 1) {
                // Draws the entire path for every animation frame so the line is smooth
                ctx.beginPath();
                ctx.moveTo(player.path[0].x, player.path[0].y);
                for (let i = 1, j = 0; i < player.path.length; i++) {
                    if (i == player.jumps[j]) {
                        // Draws the gaps in the line. Checks if the jump value is closed with another value
                        if (player.jumps.length > j + 1) {
                            i = player.jumps[j + 1];
                            // If the position in the path is equal to the current player position after a jump then there is not enough points to make a line, therefore we need to draw a dot instead
                            if (
                                player.path[i].x === player.x &&
                                player.path[i].y === player.y
                            ) {
                                ctx.stroke();
                                ctx.closePath();
                                drawDot(player, radius);
                                break;
                            }
                            if (player.jumps.length >= j + 2) j += 2;
                            ctx.moveTo(player.path[i].x, player.path[i].y);
                        }
                    } else {
                        ctx.lineTo(player.path[i].x, player.path[i].y);
                    }
                }
                // If line is currently jumping then draw line as a dot
                if (player.isJumping || player.isFlying) {
                    ctx.stroke();
                    ctx.closePath();
                    drawDot(player, radius);
                }
                ctx.stroke();
                ctx.closePath();
            }
        }
    });
}

function drawDot(player, radius) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

// Object to store the state of the arrow keys
const keyState = {
    ArrowLeft: 0,
    ArrowRight: 0,
};
warmupBtn.addEventListener("click", startWarmup);
function startWarmup() {
    socket.emit("warmUp");
    warmupBtn.classList.add("display-none");
}

// Update keyState based on keydown and keyup events
document.addEventListener("keydown", (event) => {
    let key = event.key;
    if (!keyState[key]) {
        if (key == "ArrowLeft") {
            keyState[key] = keyState.ArrowRight + 1;
            socket.emit("keyState", keyState);
        } else if (key == "ArrowRight") {
            keyState[key] = keyState.ArrowLeft + 1;
            socket.emit("keyState", keyState);
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key in keyState) {
        keyState[event.key] = 0;
        socket.emit("keyState", keyState);
    }
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let message = messageInput.value;
    if (message === "") return;
    // VULNERABLE TO XSS ATTACKS
    message = `<span style="color: ${curPlayer.color}">${curPlayer.username}:</span> ${message}`;
    socket.emit("chat", message);
    displayMessage(message);
    messageInput.value = "";
});

function displayMessage(message) {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.innerHTML = message;
    li.appendChild(p);
    document.getElementById("textbox").appendChild(li);
    const textbox = document.getElementById("textbox");
    textbox.scrollTop = textbox.scrollHeight;
}

function displayScoreboard(newPlayer) {
    let html = scoretable.innerHTML;
    players.push(newPlayer);
    html += `<div id="player${newPlayer.color}" class="player">
                    <div class="playerRoundScore"></div>
                    <div class="playerIcon">${players.length}</div>
                    <div class="playerName" style="color: ${newPlayer.color}">${newPlayer.username}</div>
                    <div class="playerScore">0</</div>
            </div>`;
    scoretable.innerHTML = html;
}

function rerenderScoretable() {
    let html = "";
    for (let i = 0; i < players.length; i++) {
        // let displayPlayerRoundScore = players[i].collided
        //     ? "display: block"
        //     : "display: none";
        html += `<div id="player${players[i].color}" class="player">  
                    <div class="playerRoundScore">+ ${
                        players[i].roundScore
                    }</div>
                    <div class="playerIcon">${i + 1}</div>
                    <div class="playerName" style="color: ${
                        players[i].color
                    };">${players[i].username}</div>
                    <div class="playerScore">${
                        players[i].leaderboardScore
                    }</div>
            </div>`;
    }
    scoretable.innerHTML = html;
}
