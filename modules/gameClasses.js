const { v4: uuidv4 } = require("uuid");

class GameStates {
    constructor() {
        this.MAX_PLAYERS = 2;
        this.games = [];
    }

    joinPublic() {
        return new Promise((resolve) => {
            for (let i = 0; i < this.games.length; i++) {
                if (this.games[i].count < this.MAX_PLAYERS) {
                    console.log("Game exists, getting id");
                    return resolve(this.games[i].id);
                }
            }
            // Generate a new room if no available
            console.log("No games, creating a new");
            const newID = uuidv4();
            this.games.push(new Game(newID));
            return resolve(newID);
        });
    }

    joinByID(id, user) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < this.games.length; i++) {
                if (
                    this.games[i].count < this.MAX_PLAYERS &&
                    this.games[i].id == id
                ) {
                    this.games[i].players.push(new Player(user));
                    return resolve(this.games[i].id, user);
                } else if (this.games[i].count > this.MAX_PLAYERS) {
                    reject(new Error("This game is full."));
                }
            }
            reject(new Error("Game does not exist."));
        });
    }

    leaveGame(id, userId) {
        console.log("leaveGame called");
        this.games = this.games.filter((game) => {
            if (game.id === id) {
                if (game.count == 1) {
                    return false;
                } else {
                    console.log("Before " + game.players);
                    let index = game.players
                        .map((user) => user.id)
                        .indexOf(userId);
                    game.players.splice(index, 1);
                    console.log("After: " + game.players);
                }
                return true;
            }
        });
    }
}

class Game {
    constructor(id) {
        this._id = id;
        this._players = [];
        this._playerParking = [];
    }

    get id() {
        return this._id;
    }

    get players() {
        return this._players;
    }

    get count() {
        return this._players.length + this._playerParking.length;
    }

    playerExists(player) {
        return this._players.includes(player);
    }
}

class Player {
    constructor(user) {
        this._username = user.name;
        this._userId = user.id;
    }
}

const gameStates = new GameStates();

module.exports = gameStates;
