exports.getGameById = (req, res, next) => {
    res.send("Game by id");
};

exports.play = (req, res, next) => {
    const io = req.io;
    //console.log(io);

    io.on("connection", function (socket) {
        console.log("User has connected to Index");
        //ON Events
        console.log(socket.id);
        //End ON Events
    });

    res.render("socket");
};

exports.joinGameById = (req, res, next) => {
    res.send("Join game by id");
};

exports.createGame = (req, res, next) => {
    res.send("Create game");
};
