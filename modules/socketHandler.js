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

        // Join websocket room with client-provided ID
        socket.join(gameID);

        // Listen for "chat" events and emit to other users in the same room. Use profanity filter to filter out bad words.
        socket.on("chat", (message) => {
            socket.to(gameID).emit("chat", profanity.censor(message));
        });

        socket.on("newPlayer", (players) => {
            socket.to(gameID).emit("newPlayer", players[players.length - 1]);
            if (players.length >= gameStates.MAX_PLAYERS) {
                game.mode = "game";
                game.countdown(io);
            }
        });

        socket.on("updatePosition", (keyState) => {
            let player = game.updatePosition(userID, keyState);
            if (game.mode === "game") {
                let score = game.players.filter((p) => p.collided).length + 1;

                if (player.collided) {
                    game.updateLeaderBoard(io, score);
                } else if (score >= game.players.length) {
                    game.roundFinish(io);
                }
            }
        });

        socket.on("warmUp", () => {
            let player = game.player(userID);
            player.resetState();
            player.isMoving = true;
            game.updates.set(userID, game.playerDTO(userID));
            // game.mode = "warmUp";
            game.startGame(io);
        });

        socket.on("endGame", () => {
            game.endGame(io, gameID);
        });

        // Handle client disconnect, by error or on purpose. Removes the player from the gamestate logic.
        socket.on("disconnect", () => {
            socket.to(gameID).emit("leaveGame", userID);
            console.log("Disconnect: " + gameID);
            gameStates.leaveGame(gameID, userID);
        });
    });
};
