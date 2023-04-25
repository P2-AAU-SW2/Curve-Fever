const { v4: uuidv4 } = require("uuid");

class gameInstances {
    constructor() {
        this.MAX_PLAYERS = 6;
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

    leaveGame(id) {
        this.publicGames = this.publicGames.filter((game) => {
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
    res.render("game");
};

exports.play = async (req, res, next) => {
    const gameID = await gameManager.joinPublic();
    res.redirect(`/game/${gameID}`);
};

exports.joinGameById = (req, res, next) => {
    res.send("Join game by id");
};

exports.createGame = (req, res, next) => {
    res.send("Create game");
};
