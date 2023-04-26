const { v4: uuidv4 } = require("uuid");

class gameInstances {
    constructor() {
        this.MAX_PLAYERS = 2;
        (this.publicGames = []), (this.privateGames = []);
    }

    joinPublic() {
        return new Promise((resolve) => {
            for (let i = 0; i < this.publicGames.length; i++) {
                if (this.publicGames[i].users < this.MAX_PLAYERS) {
                    this.publicGames[i].users++;
                    return resolve(this.publicGames[i].id);
                }
            }
            // Generate a new room if no available
            const newID = uuidv4();
            this.publicGames.push({
                id: newID,
                users: 1,
            });
            return resolve(newID);
        });
    }

    joinByID(id) {
        return new Promise((resolve) => {
            //console.log("here: " + id);
            for (let i = 0; i < this.publicGames.length; i++) {
                if (
                    this.publicGames[i].users < this.MAX_PLAYERS &&
                    this.publicGames[i].id === id
                ) {
                    this.publicGames[i].users++;
                    return resolve(this.publicGames[i].id);
                } else if (this.publicGames[i].users > this.MAX_PLAYERS) {
                    return reject("Game already full");
                }
            }
            return rejects("Does not exist");
        });
    }

    leaveGame(id) {
        //console.log("Trying to leave");
        this.publicGames = this.publicGames.filter((game) => {
            //console.log("Provided ID: " + id + " Game list ID: " + game.id);
            if (game.id === id) {
                if (game.users === 1) {
                    return false;
                } else {
                    game.users--;
                }
            }
            return true;
        });
    }
}

let gameManager = new gameInstances();

function logger() {
    console.log(gameManager.publicGames);
}

setInterval(logger, 1500);

exports.getGameById = async (req, res, next) => {
    const redirected = req.query.valid;
    console.log("Test: " + redirected);

    if (redirected) {
        res.render("game");
    } else {
        res.redirect("/");
    }
};

exports.play = async (req, res, next) => {
    // Check if it should join a game, or create a new based on if an ID is provided
    //console.log(req.params.id);
    if (req.params.id === undefined) {
        gameManager
            .joinPublic()
            .then((id) => {
                //console.log(id);
                res.redirect(`/game/${id}/?valid=true`);
            })
            .catch((error) => console.log(error));
    } else {
        gameManager
            .joinByID(req.params.id)
            .then((id) => {
                res.redirect(`/game/${id}/?valid=true`);
            })
            .catch((error) => console.log(error));
    }
};

exports.joinGameById = (req, res, next) => {
    res.send("Join game by id");
};

exports.createGame = (req, res, next) => {
    res.send("Create game");
};

exports.gameManager = gameManager;
