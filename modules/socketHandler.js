const { gameStates } = require("./gameClasses");
const profanity = require("@2toad/profanity").profanity;

module.exports = async (io) => {
    io.on("connection", (socket) => {
        // Get query parameters set by client
        const gameID = socket.handshake.query.gameID;
        const userID = socket.handshake.query.userID;

        const game = gameStates.getGame(gameID);

        if (!game) {
            socket.emit("gameNotFound");
            return;
        }

        const player = game.player(userID);

        if (!player) {
            socket.emit("gameNotFound");
            return;
        }

        // Join websocket room with client-provided ID
        socket.join(gameID);

        // Listen for "chat" events and emit to other users in the same room. Use profanity filter to filter out bad words.
        socket.on("chat", (message) => {
            socket.to(gameID).emit("chat", profanity.censor(message));
        });

        socket.on("keyState", (keyState) => {
            if (player) player.keyState = keyState;
        });

        // When new player joins
        socket.on("newPlayer", (players) => {
            // On reconnect send the current game rounds
            if (game.mode === "game") {
                socket.emit("gameInProgress", game._rounds);
                return;
            }

            // Send new player state to every other player and check if we can begin match
            socket.to(gameID).emit("newPlayer", players[players.length - 1]);
            if (players.length >= gameStates.MAX_PLAYERS) {
                game.mode = "game";
                io.in(gameID).emit("gameMode");
                game.countdown(io); // Starts new round with countdown
            }
        });

        socket.on("warmUp", () => {
            player.resetState();
            player.isMoving = true;
            game.updates.set(userID, game.playerDTO(userID));
            game.startGame(io);
        });

        socket.on("endGame", () => {
            game.endGame(io, gameID);
        });

        // Handle client disconnect, by error or on purpose. Removes the player from the gamestate logic.
        socket.on("disconnect", () => {
            socket.to(gameID).emit("leaveGame", userID);
            gameStates.leaveGame(gameID, userID);
        });
    });
};
