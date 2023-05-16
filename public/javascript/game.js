/* global io, players, curPlayer, gameId */
const messageInput = document.getElementById("usermsg");
const form = document.getElementById("form");
const scoretable = document.querySelector("#scoretable tbody");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const warmupBtn = document.getElementById("warmup-btn");
// const roundCounter = document.getElementById("roundCounter");

const socket = io({
    query: {
        gameID: gameId,
        userID: curPlayer.userId,
    },
});

socket.on("connect", () => {
    console.log(players);
    socket.emit("newPlayer", players);
    if (players.length === 3) {
        socket.emit(
            "chat",
            "ANNOUCEMENT! <br> Game starting in 3 seconds, GET READY!"
        );
        displayMessage(
            "ANNOUCEMENT! <br> Game starting in 3 seconds, GET READY!"
        );
        socket.emit("roomFull");
    }
});

socket.on("chat", (message) => {
    displayMessage(message);
});

socket.on("newPlayer", (player) => {
    console.log(player);
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

socket.on("warmUpUpdatePosition", (updatedPlayers) => {
    updatedPlayers.forEach((updatedPlayer) => {
        let i = players.findIndex((el) => el.userId === updatedPlayer.userId);
        players[i] = updatedPlayer;

        // If the current player collided clear interval
        if (
            updatedPlayer.collided &&
            updatedPlayer.userId === curPlayer.userId
        ) {
            clearInterval(window.gameLoop);
            warmupBtn.classList.remove("display-none");
        }

        draw(players);
    });
});

socket.on("gameUpdatePosition", (updatedPlayers) => {
    updatedPlayers.forEach((updatedPlayer) => {
        let i = players.findIndex((el) => el.userId === updatedPlayer.userId);
        players[i] = updatedPlayer;

        draw(players);
    });
});

socket.on("roomFull", () => {
    console.log("Game started");
    clearInterval(window.gameLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    warmupBtn.classList.add("display-none");
    startCountdown().then(() => {
        startRound();
    });
});

socket.on("renderScoreTable", (updatedPlayers) => {
    updatedPlayers.forEach((updatedPlayer) => {
        let i = players.findIndex((el) => el.userId === updatedPlayer.userId);
        players[i] = updatedPlayer;
    });
    rerenderScoretable();
});

function startCountdown() {
    console.log("Starting countdown");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let count = 3;
    return new Promise((resolve) => {
        var countdown = setInterval(() => {
            count === 0
                ? (clearInterval(countdown), resolve())
                : displayCountdown(count);
            count--;
        }, 1000);
        function displayCountdown(i) {
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bolder 60px Arial";
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctx.fillText(String(i), canvas.width / 2, canvas.height / 2); // draw countdown on the canvas
        }
    });
}

function startRound() {
    socket.emit("gameStart");
    window.gameLoop = setInterval(() => {
        socket.emit("gameUpdatePosition", keyState);
    }, 1000 / 60);
}

function draw(players) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players.forEach((player) => {
        if (player.isMoving) {
            ctx.strokeStyle = player.color;
            ctx.fillStyle = player.color;
            ctx.lineWidth = player.lineWidth;
            ctx.lineCap = "round";
            const radius = player.lineWidth * 0.0933 + 0.1;
            if (player.isFlying) {
                ctx.beginPath();
                ctx.arc(player.x, player.y, radius * 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            } else if (player.path.length > 1) {
                // Draws the entire path for every animation frame so the line is smooth
                ctx.beginPath();
                ctx.moveTo(player.path[0].x, player.path[0].y);
                for (let i = 1, j = 0; i < player.path.length; i++) {
                    if (i == player.jumps[j]) {
                        // Draws the gaps in the line. Checks if the jump value is closed with another value
                        if (player.jumps.length > j + 1) {
                            i = player.jumps[j + 1];
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
                    ctx.beginPath();
                    ctx.arc(player.x, player.y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.closePath();
                }
                ctx.stroke();
                ctx.closePath();
            }
        }
    });
}

// Object to store the state of the arrow keys
const keyState = {
    ArrowLeft: 0,
    ArrowRight: 0,
};
warmupBtn.addEventListener("click", startWarmup);
function startWarmup() {
    socket.emit("warmUpStart");
    warmupBtn.classList.add("display-none");
    window.gameLoop = setInterval(() => {
        socket.emit("warmUpUpdatePosition", keyState);
    }, 1000 / 60);
}

// Update keyState based on keydown and keyup events
document.addEventListener("keydown", (event) => {
    let key = event.key;
    if (!keyState[key]) {
        if (key == "ArrowLeft") {
            keyState[key] = keyState.ArrowRight + 1;
        } else if (key == "ArrowRight") {
            keyState[key] = keyState.ArrowLeft + 1;
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key in keyState) {
        keyState[event.key] = 0;
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
    html += `<tr id="player${newPlayer.color}">
                <td>${players.length}</td>
                <td style="color: ${newPlayer.color}">${newPlayer.username}</td>
                <td>0</</td>
            </tr>`;
    scoretable.innerHTML = html;
}

function rerenderScoretable() {
    let html = "";
    for (let i = 0; i < players.length; i++) {
        html += `<tr id="player${players[i].color}">
            <td>${i + 1}</td>
            <td style="color: ${players[i].color};">${players[i].username}</td>
            <td>${players[i].roundRanking}</td>
        </tr>`;
    }
    scoretable.innerHTML = html;
}
