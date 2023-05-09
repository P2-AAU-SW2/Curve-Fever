const { v4: uuidv4 } = require("uuid");

// Class for keeping all logic related to running games.
class GameStates {
    constructor() {
        this.MAX_PLAYERS = 3; // Limits the number of people in the same room
        this.games = []; // Array for games
    }

    /* 
        This method will check each current game for available slots, and if found resolve the promise by returning an id.

        If a game is not found, a new will be created with a unique ID.
    */
    joinPublic() {
        return new Promise((resolve) => {
            for (let i = 0; i < this.games.length; i++) {
                if (this.games[i].count < this.MAX_PLAYERS) {
                    return resolve(this.games[i].id);
                }
            }

            // Generate a new room if no available, and push it to current games.
            console.log("No games, creating a new!");
            const newID = uuidv4();
            this.games.push(new Game(newID));
            return resolve(newID);
        });
    }

    /*
        Joins a player to an existing game, by an ID or if used with joinPublic, then redirected to this function.

        Handles if the requested game is full, or no longer active.
    */
    joinByID(id, user) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < this.games.length; i++) {
                if (
                    this.games[i].count < this.MAX_PLAYERS &&
                    this.games[i].id == id
                ) {
                    this.games[i].players.push(new Player(user));
                    return resolve(this.games[i].id, user);
                } else if (this.games[i].count >= this.MAX_PLAYERS) {
                    reject(new Error("This game is full."));
                }
            }
            const err = new Error("Game does not exist.");
            err.status = 404;
            reject(err);
        });
    }
    /*
        Logic for removing a player. Gets called in socketHandler.js when a client disconnects.
    */
    leaveGame(id, userId) {
        this.games = this.games.filter((game) => {
            if (game.id === id) {
                if (game.count == 1) {
                    return false;
                } else {
                    // Find the index of the player within a game, and remove them.
                    let index = game.players
                        .map((user) => user.id)
                        .indexOf(userId);
                    game.players.splice(index, 1);
                }
                return true;
            }
        });
    }
}

// Every game gets an object from this class. Keeps track on major details within each game.
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

// Class for players to store data.
class Player {
    constructor(user) {
        this._username = user.name;
        this._userId = user.id;
    }
}

const gameStates = new GameStates();

module.exports = gameStates;
