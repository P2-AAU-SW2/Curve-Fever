const { gameStates } = require("./gameClasses");
const profanity = require("@2toad/profanity").profanity;

module.exports = async (io) => {
    io.on("connection", (socket) => {
        // Get query parameters set by client
        const gameID = socket.handshake.query.gameID;
        const userID = socket.handshake.query.userID;

        // Join websocket room with client-provided ID
        socket.join(gameID);

        // Listen for "chat" events and emit to other users in the same room. Use profanity filter to filter out bad words.
        socket.on("chat", (message) => {
            socket.to(gameID).emit("chat", profanity.censor(message));
        });

        socket.on("newPlayer", (players) => {
            socket.to(gameID).emit("newPlayer", players[players.length - 1]);
        });

        socket.on("roomFull", () => {
            let game = gameStates.getGame(gameID);
            game.startGame(io, gameID);
            io.in(gameID).emit("roomFull");
        });

        socket.on("updatePosition", (keyState) => {
            let game = gameStates.getGame(gameID);
            let player = game.updatePosition(userID, keyState);
            // Add the update to the map
            game.updates.set(userID, player);
        });

        socket.on("gameStart", () => {
            let game = gameStates.getGame(gameID);
            game.startGame(io, gameID);
        });

        // socket.on("playerWon", () => {
        //     io.in(gameID).emit("playerWon");
        // });

        // Handle client disconnect, by error or on purpose. Removes the player from the gamestate logic.
        socket.on("disconnect", () => {
            socket.to(gameID).emit("leaveGame", userID);
            console.log("Disconnect: " + gameID);
            gameStates.leaveGame(gameID, userID);
        });
    });
};
