const playerCells = document.querySelectorAll("#scoretable td:nth-child(2)");
const playerColors = ["#32BEFF", "#FF6DDE", "#FFF116", "#B9FF32", "#FF6D6D"];

for (let i = 0; i < playerCells.length; i++) {
    playerCells[i].style.color = playerColors[i % playerColors.length];
}
const messageInput = document.getElementById("usermsg");
const form = document.getElementById("form");

const url = window.location.href;
const gameID = url.slice(url.indexOf("game") + 5, -12); // 12 tager hensyn for /?valid=true

const socket = io({
    query: {
        gameID: gameID,
    },
});

socket.on("connect", () => {
    console.log(socket.id);
});

socket.on("chat", (message) => {
    displayMessage(message);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message === "") return;
    socket.emit("chat", message);
    displayMessage(message);
    messageInput.value = "";
});

function displayMessage(message) {
    const div = document.createElement("div");
    div.textContent = message;
    document.getElementById("textbox").append(div);
}
