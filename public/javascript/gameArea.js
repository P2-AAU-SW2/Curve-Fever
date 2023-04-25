const playerCells = document.querySelectorAll("#scoretable td:nth-child(2)");
const playerColors = ["#32BEFF", "#FF6DDE", "#FFF116", "#B9FF32", "#FF6D6D"];

for (let i = 0; i < playerCells.length; i++) {
    playerCells[i].style.color = playerColors[i % playerColors.length];
}

const joinRoomButton = document.getElementById("room-button");
const roomInput = document.getElementById("usermsg");
const messageInput = document.getElementById("usermsg");
const form = document.getElementById("form");
const socket = io();

socket.on("chat", (message) => {
    displayMessage(message);
    console.log(message);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const room = roomInput.value;
    if (message === "") return;
    socket.emit("chat", message);
    messageInput.value = "";
});

joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value;
});

function displayMessage(message) {
    const div = document.createElement("div");
    div.textContent = message;
    document.getElementById("textbox").append(div);
}
