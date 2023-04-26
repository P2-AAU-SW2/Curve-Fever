const gameStates = require("../modules/gameClasses");

function logger() {
    console.log(gameStates.games[0].players);
}

//setInterval(logger, 3000);

exports.getGameById = async (req, res, next) => {
    // Call the class/object method "joinById" from "gameClasses". Handle errors by calling global ErrorHandler, which redirects the user.
    gameStates.joinByID(req.params.id, req.user).then(
        (result) => {
            res.render("game", {
                userName: req.user.name,
                userId: req.user.id,
                gameId: req.params.id,
            });
        },
        (error) => {
            next(error);
        }
    );
};

exports.play = async (req, res, next) => {
    // Call the class/object method "joinPublic" from "gameClasses" to get a game to join.
    gameStates
        .joinPublic()
        .then((id) => {
            res.redirect(`/game/${id}`); // Redirect to the game page.
        })
        .catch((error) => next(error));
};

exports.joinGameById = (req, res, next) => {
    res.send("Join game by id");
};

exports.createGame = (req, res, next) => {
    res.send("Create game");
};
