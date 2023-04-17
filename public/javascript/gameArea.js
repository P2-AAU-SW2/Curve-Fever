const playerCells = document.querySelectorAll("#scoretable td:nth-child(2)");
const playerColors = ["#32BEFF", "#FF6DDE", "#FFF116", "#B9FF32", "#FF6D6D"];

for (let i = 0; i < playerCells.length; i++) {
    playerCells[i].style.color = playerColors[i % playerColors.length];
}
