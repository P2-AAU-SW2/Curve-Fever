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
                    this.games[i].players.push(
                        generatePlayer(user, this.games[i].players)
                    );
                    return resolve(this.games[i]);
                } else if (this.games[i].count >= this.MAX_PLAYERS) {
                    reject(new Error("This game is full."));
                }
            }
            reject(new Error("Game does not exist."));
        });
    }

    // Get current game
    getGame(gameId) {
        return this.games[this.games.findIndex((el) => el.id === gameId)];
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

    player(id) {
        return this._players[this._players.findIndex((el) => el.userId === id)];
    }

    playerDTO(id) {
        return generateDTO(this.player(id));
    }

    get playersDTO() {
        let arr = [];
        this.players.forEach((player) => {
            arr.push(generateDTO(player));
        });
        return arr;
    }

    playerExists(player) {
        return this._players.includes(player);
    }

    updatePosition(userId, keyState) {
        let player = this.player(userId);
        if (player.collided) player.resetState();
        player.keyState = keyState;
        player.update(this.players);
        return player.playerDTO();
    }
}
// updateGamePosition(userId, keyState) {
//     let player = this.player(userId);
//     if (player.roundRanking == 2) this.players.resetState();
//     player.keyState = keyState;
//     player.update(this.players);
//     return player.playerDTO();
// }

function generateDTO(state) {
    let obj = {};
    obj.userId = state.userId;
    obj.username = state.username;
    obj.x = state.x;
    obj.y = state.y;
    obj.color = state.color;
    obj.jumps = state.jumps;
    obj.path = state.path;
    obj.collided = state.collided;
    obj.lineWidth = state.lineWidth;
    obj.isJumping = state.isJumping;
    obj.isFlying = state.isFlying;
    obj.isMoving = state.isMoving;
    return obj;
}

function generatePlayer(user, players) {
    let canvas = { width: 500, height: 500 };
    return new Player(
        user,
        getColor(players),
        canvas.width * (Math.random() * 0.7 + 0.15),
        canvas.width * (Math.random() * 0.7 + 0.15),
        7,
        Math.random() * (Math.PI + Math.PI / 2),
        1.5,
        { ArrowLeft: 0, ArrowRight: 0 },
        canvas
    );
}

function getColor(players) {
    const playerColors = [
        "#32BEFF",
        "#FF6DDE",
        "#FFF116",
        "#B9FF32",
        "#FF6D6D",
    ];
    if (players.length) {
        for (let i in playerColors) {
            let col = playerColors[i];
            if (players.every((player) => player.color !== col)) return col;
        }
    } else {
        return playerColors[0];
    }
}

// Class for players to store data.
class Player {
    constructor(
        user,
        color,
        x,
        y,
        lineWidth,
        direction,
        speed,
        keyState,
        canvas
    ) {
        this.userId = user.id;
        this.username = user.name;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.color = color;
        this.speed = speed;
        this.path = [];
        this.turnSpeed = 0.065;
        this.turnDirection = 0;
        this.lineWidth = lineWidth;
        this.collided = false;
        this.jumps = [];
        this.jumpFrames = lineWidth * 2;
        this.flyFrames = lineWidth * 10;
        this.AccJumpFrames = 0;
        this.jumpChance = 0.0;
        this.jumpFrequency = 0.005;
        this.keyState = keyState;
        this.canvas = canvas;
        this.isJumping = false;
        this.isFlying = true;
        this.isMoving = false;
        this.leaderboardRanking = 0;
        this.roundRanking = 0;
    }

    // Data Transfer Object (DTO)
    playerDTO() {
        return generateDTO(this);
    }

    update(players) {
        if (!this.isMoving) this.isMoving = true;
        this.collision(players);
        if (!this.collided) {
            this.jumping();
            // Update direction based on keyState
            if (this.keyState.ArrowLeft > this.keyState.ArrowRight) {
                this.direction -= this.turnSpeed;
            } else if (this.keyState.ArrowLeft < this.keyState.ArrowRight) {
                this.direction += this.turnSpeed;
            }

            // Update position based on direction and speed
            this.x += Math.cos(this.direction) * this.speed;
            this.y += Math.sin(this.direction) * this.speed;

            // Add the current position to the path
            if (!this.isJumping && !this.isFlying)
                this.path.push({ x: this.x, y: this.y });
        } else {
            this.path = []; // *****Only in warmup
            this.isMoving = false;
        }
    }

    collision(players) {
        // Check if curve hit the wall
        if (!this.isFlying) {
            if (
                this.x < 0 ||
                this.x > this.canvas.width ||
                this.y < 0 ||
                this.y > this.canvas.height
            ) {
                this.collided = true;
            }

            if (!this.isJumping) {
                // Check if curve hit its own path. Don't check recent points in path since it can collide with them
                // given the current point is close enough. This logic needs to be different for hitting other players
                players.forEach((player) => {
                    let buffer =
                        player.userId === this.userId ? this.lineWidth : 0;
                    for (let i = 0; i < player.path.length - buffer; i++) {
                        // L2 norm: get shortest distance
                        const distance = Math.sqrt(
                            (player.path[i].x - this.x) ** 2 +
                                (player.path[i].y - this.y) ** 2
                        );
                        if (distance < this.lineWidth - 0.1) {
                            this.collided = true;
                            break;
                        }
                    }
                });
            }
        }
    }

    jumping() {
        if (this.isFlying || this.isJumping) {
            this.AccJumpFrames++;
        } else {
            let chance = Math.floor(Math.random() * 11) * this.jumpChance;
            if (chance >= 5) {
                this.toggleJump();
                this.jumpChance = 0.0;
            } else {
                this.jumpChance += this.jumpFrequency;
            }
        }
        if (
            (this.isFlying && this.flyFrames <= this.AccJumpFrames) ||
            (this.isJumping && this.jumpFrames <= this.AccJumpFrames)
        ) {
            this.toggleJump();
        }
    }

    toggleJump() {
        if (this.isFlying) this.isFlying = !this.isFlying;
        else {
            this.jumps.push(this.path.length);
            this.isJumping = !this.isJumping;
        }
        this.AccJumpFrames = 0;
    }

    resetState() {
        // FIND BETTER DYNAMIC SOLUTION
        this.x = this.canvas.width * (Math.random() * 0.7 + 0.15);
        this.y = this.canvas.width * (Math.random() * 0.7 + 0.15);
        this.direction = Math.random() * (Math.PI + Math.PI / 2);
        this.path = [];
        this.collided = false;
        this.jumps = [];
        this.AccJumpFrames = 0;
        this.jumpChance = 0.0;
        this.keyState = { ArrowLeft: 0, ArrowRight: 0 };
        this.isJumping = false;
        this.isFlying = true;
        this.isMoving = false;
    }
}

const gameStates = new GameStates();

module.exports = gameStates;
