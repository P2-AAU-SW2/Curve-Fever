const playerCells = document.querySelectorAll("#scoretable td:nth-child(2)");
const playerColors = ["#32BEFF", "#FF6DDE", "#FFF116", "#B9FF32", "#FF6D6D"];

for (let i = 0; i < playerCells.length; i++) {
    playerCells[i].style.color = playerColors[i % playerColors.length];
}
const messageInput = document.getElementById("usermsg");
const form = document.getElementById("form");

const gameID = document.getElementById("gameId").value;
const userID = document.getElementById("userId").value;
const userName = document.getElementById("userName").value;

const socket = io({
    query: {
        gameID: gameID,
        userID: userID,
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
    let message = messageInput.value;
    if (message === "") return;
    message = userName + ": " + message;
    socket.emit("chat", message);
    displayMessage(message);
    messageInput.value = "";
});

function displayMessage(message) {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.textContent = message;
    li.appendChild(p);
    document.getElementById("textbox").appendChild(li);
    const textbox = document.getElementById("textbox");
    textbox.scrollTop = textbox.scrollHeight;
}
