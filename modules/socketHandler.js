const gameStates = require("./gameClasses");
const profanity = require("@2toad/profanity").profanity;

module.exports = async (io) => {
    io.on("connection", (socket) => {
        const gameID = socket.handshake.query.gameID;
        const userID = socket.handshake.query.userID;

        socket.join(gameID);
        //socket.to(gameID).emit("chat", "user: " + socket.id + " joined.");

        socket.on("chat", (message) => {
            console.log(message);
            socket.to(gameID).emit("chat", profanity.censor(message));
        });

        socket.on("disconnect", () => {
            console.log("Disconnect: " + gameID);
            gameStates.leaveGame(gameID, userID);
        });
    });
};
