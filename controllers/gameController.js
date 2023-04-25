class game {
    constructor(id) {
        this._id = id;
        this._players = [];
    }

    get id() {
        return this._id;
    }

    get players() {
        return this._players;
    }

    addPlayer(player) {
        this._players.push(player);
    }
}

let games = [];

exports.getGameById = (req, res, next) => {
    const io = req.app.get("io");
    const roomId = req.params.id;

    io.on("connection", (socket) => {
        socket.join(roomId);
        console.log(socket.rooms);
        console.log("User connected", socket.id);

        socket.on("chat", (msg) => {
            socket.broadcast.emit("chat", msg);
            console.log("Received data:", msg);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    });

    res.render("game");
};

exports.play = (req, res, next) => {
    res.send("play");
};

exports.joinGameById = (req, res, next) => {
    res.send("Join game by id");
};

exports.createGame = (req, res, next) => {
    res.send("Create game");
};
