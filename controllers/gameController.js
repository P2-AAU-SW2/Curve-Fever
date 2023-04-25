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
        console.log("Added player", player);
    }
}

const games = new Map();
games.set("15", new game("15"));

exports.getGameById = (req, res, next) => {
    const roomId = req.params.id;
    if (!games.has(roomId)) {
        console.log("Game not found");
        res.status(404).send("Game not found");
        return;
    }
    const game = games.get(roomId);
    const players = game.players;
    if (players.length >= 8) {
        console.log("Game is full");
        res.status(404).send("Game is full");
        return;
    }
    if (!players.includes(req.user.id)) {
        console.log("New user");
        game.addPlayer(req.user.id);
        games.set(roomId, game);
    } else {
        console.log("User already in game");
    }
    res.render("game", { roomId });
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
