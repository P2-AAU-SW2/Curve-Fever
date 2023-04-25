exports.getGameById = (req, res, next) => {
    res.send("Game by id");
};

exports.play = (req, res, next) => {
    const io = req.app.get("io");

    io.on("connection", (socket) => {
        console.log("User connected", socket.id);

        socket.on("your-event", (data) => {
            console.log("Received data:", data);

            // Broadcast the data to all connected clients
            io.emit("your-event", data);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    });

    res.render("socket");
};

exports.joinGameById = (req, res, next) => {
    res.send("Join game by id");
};

exports.createGame = (req, res, next) => {
    res.send("Create game");
};
