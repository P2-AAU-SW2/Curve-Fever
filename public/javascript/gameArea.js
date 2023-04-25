const playerCells = document.querySelectorAll("#scoretable td:nth-child(2)");
const playerColors = ["#32BEFF", "#FF6DDE", "#FFF116", "#B9FF32", "#FF6D6D"];

for (let i = 0; i < playerCells.length; i++) {
    playerCells[i].style.color = playerColors[i % playerColors.length];
}

const roomId = document.getElementById("roomId").value; // Assuming you have a hidden input with id "roomId" storing the room id
const messageInput = document.getElementById("usermsg");
const form = document.getElementById("form");
const socket = io();

socket.on("connect", () => {
    // Join the room upon connecting
    socket.emit("join-room", roomId);
});

socket.on("chat", (message) => {
    displayMessage(message);
    console.log(message);
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message === "") return;
    socket.emit("chat", roomId, message);
    messageInput.value = "";
});

function displayMessage(message) {
    const div = document.createElement("div");
    div.textContent = message;
    document.getElementById("textbox").append(div);
}

window.addEventListener("beforeunload", () => {
    socket.emit("leaveRoom", roomId);
});
