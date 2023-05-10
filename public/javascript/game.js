/* global io, players, curPlayer, gameId */
const messageInput = document.getElementById("usermsg");
const form = document.getElementById("form");
const scoretable = document.querySelector("#scoretable tbody");

const socket = io({
    query: {
        gameID: gameId,
        userID: curPlayer.userId,
    },
});

socket.on("connect", () => {
    console.log(players);
    socket.emit("newPlayer", players);
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
                <td>0</td>
            </tr>`;
    scoretable.innerHTML = html;
}

function rerenderScoretable() {
    let html = "";
    for (let i = 0; i < players.length; i++) {
        html += `<tr id="player${players[i].color}">
            <td>${i + 1}</td>
            <td style="color: ${players[i].color};">${players[i].username}</td>
            <td>0</td>
        </tr>`;
    }
    scoretable.innerHTML = html;
}
