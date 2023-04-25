exports.getGameById = (req, res, next) => {
    res.send("Game by id");
};

exports.play = (req, res, next) => {
    res.send("Play");
};

exports.joinGameById = (req, res, next) => {
    res.send("Join game by id");
};

exports.createGame = (req, res, next) => {
    res.send("Create game");
};
