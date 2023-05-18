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
        });

        socket.on("startRound", () => {
            game.startGame(io, gameID);
            io.in(gameID).emit("startRound");
        });

        socket.on("updatePosition", (keyState) => {
            let player = game.updatePosition(userID, keyState);
            if (game.mode === "game") {
                let collidedPlayers = game.players.filter((p) => p.collided);

                if (collidedPlayers.length === game.players.length - 1) {
                    game.roundFinish(collidedPlayers);
                    socket.to(gameID).emit("renderScoreTable", game.players);
                    io.in(gameID).emit("startRound");
                }
            }

            // Add the update to the map
            game.updates.set(userID, player);
        });

        // socket.on("gameUpdatePosition", (keyState) => {
        //     let game = gameStates.getGame(gameID);
        //     let player = game.gameUpdatePosition(userID, keyState);
        //     let collidedPlayers = game.players.filter((p) => p.collided);

        //     if (collidedPlayers.length === game.players.length - 1) {
        //         game.roundFinish(collidedPlayers);
        //         socket.to(gameID).emit("renderScoreTable", game.players);
        //         io.in(gameID).emit("startRound");
        //     }

        //     // Add the update to the map
        //     game.updates.set(userID, player);
        // });

        socket.on("gameStart", (mode) => {
            game.mode = mode;
            game.startGame(io, gameID);
        });

        socket.on("endGame", () => {
            game.endGame(io, gameID);
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
