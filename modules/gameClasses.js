const { v4: uuidv4 } = require("uuid");
const { updateScores } = require("./database.js");

const LINE_WIDTH = 10;
const MAX_SCORE = 20;
const CELL_SIZE = LINE_WIDTH * 2;

// Class for keeping all logic related to running games.
class GameStates {
    constructor() {
        this.MAX_PLAYERS = 5; // Limits the number of people in the same room
        this.games = []; // Array for games
    }

    /* 
        This method will check each current game for available slots, and if found resolve the promise by returning an id.

        If a game is not found, a new will be created with a unique ID.
    */
    joinPublic(user) {
        return new Promise((resolve) => {
            //Check if user is already in a game
            for (let i = 0; i < this.games.length; i++) {
                const game = this.games[i];
                if (game.mode === "game") {
                    for (let j = 0; j < game._players.length; j++) {
                        const player = game._players[j];
                        if (player.userId == user.id) {
                            player.reconnect();
                            return resolve(game.id);
                        }
                    }
                }
            }

            //Check if there is an available room to join
            for (let i = 0; i < this.games.length; i++) {
                if (this.games[i]._players.length < this.MAX_PLAYERS) {
                    return resolve(this.games[i].id);
                }
            }

            // Generate a new room if no available, and push it to current games.
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
                if (this.games[i].id == id) {
                    if (this.games[i].player(user.id)) {
                        console.log("player already in game JoinById");
                        this.games[i].player(user.id).reconnect();
                        return resolve(this.games[i]);
                    }
                    if (this.games[i]._players.length < this.MAX_PLAYERS) {
                        this.games[i].players.push(
                            generatePlayer(user, this.games[i].players)
                        );
                        return resolve(this.games[i]);
                    } else {
                        reject(new Error("This game is full."));
                    }
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
        console.log("leaveGame");
        this.games = this.games.filter((game) => {
            if (game.id === id) {
                if (game.activeCount <= 1) {
                    clearInterval(game.interval);
                    return false;
                }

                // If the game is in game mode, and the player disconnects, keep user in array.
                if (game.mode === "game") {
                    game.player(userId).disconnect();
                    return true;
                } else {
                    // Find the index of the player within a game, and remove them.
                    let index = game._players
                        .map((user) => user.id)
                        .indexOf(userId);
                    game._players.splice(index, 1);
                }
                return true;
            }
            return true;
        });
    }
}

// Every game gets an object from this class. Keeps track on major details within each game.
class Game {
    constructor(id) {
        this._id = id;
        this._players = [];
        this._updates = new Map();
        this._rounds = 0;
        this.mode = "warmUp";
        this.spatialHashTable = {};
        this.syncTime = 2; // Sync with client every 2 seconds
    }

    get id() {
        return this._id;
    }

    get players() {
        return this._players;
    }

    // Get the amount of players that are connected
    get activeCount() {
        let res = 0;
        for (let i = 0; i < this._players.length; i++) {
            if (this._players[i].isConnected) res++;
        }
        return res;
    }

    get updates() {
        return this._updates;
    }

    player(id) {
        return this._players[this._players.findIndex((el) => el.userId === id)];
    }

    // Get minified version of player instance
    playerDTO(id) {
        return generateDTO(this.player(id));
    }

    // Get very minified version of player instance (doesn't include path)
    playerPosDTO(player) {
        let obj = {};
        obj.userId = player.userId;
        obj.isJumping = player.isJumping;
        obj.isFlying = player.isFlying;
        obj.jumps = player.jumps;
        obj.x = player.x;
        obj.y = player.y;
        return obj;
    }

    // Get minified version of all player instances
    get playersDTO() {
        let arr = [];
        this.players.forEach((player) => {
            arr.push(generateDTO(player));
        });
        return arr;
    }

    // Check if player exists in the game. Used for reconnection
    playerExists(player) {
        return this._players.includes(player);
    }

    // Upper function: calls all other functions requried to update all players
    updateAll(io) {
        let playersCollided = 0;
        this._players.forEach((player) => {
            // Only update position if player hasn't collided and is moving. A player can be both not collided and not moving in warm up
            if (!player.collided) {
                if (player.isMoving) {
                    this.updatePosition(player.userId); // Update position of current player
                    if (player.collided && this.mode === "game") {
                        this.updateLeaderBoard(io);
                        playersCollided++;
                    }
                }
            } else {
                playersCollided++;
            }
        });
        if (
            playersCollided >= this._players.length - 1 &&
            this.mode === "game"
        ) {
            this.roundFinish(io);
        }
    }

    // Calls all the required functions and operations to update a specific player
    updatePosition(userId) {
        let player = this.player(userId); // Get current player
        player.update(this.players); // Actually update the player state
        if (player.collided) {
            if (this.mode === "warmUp") player.resetState(); // reset state on collision in warmup  -  Line only have to be removed from canvas on collision in warm up mode
        } else if (!this.timeToSync(player)) {
            let playerPosDTO = this.playerPosDTO(player); // Only send updated position
            this.updates.set(userId, playerPosDTO);
            return playerPosDTO;
        }
        // Every other second client needs to sync with server (send entire path of coordinates)
        let playerDTO = player.playerDTO();
        // Add the update to the map
        this.updates.set(userId, playerDTO);
        return playerDTO;
    }

    // Update the leaderboard
    updateLeaderBoard(io) {
        let activePlayers = this.players.filter((p) => !p.collided);
        activePlayers.forEach((player) => {
            player.leaderboardScore++;
            player.roundScore++;
        });

        io.in(this.id).emit("renderScoreTable", this.playersDTO);
    }

    // Start new round and send countdown to players. Only called in "game" mode
    async countdown(io) {
        this._rounds++;
        // Send round number to clients
        io.in(this.id).emit("round", this._rounds);

        // Clear and reset state
        clearInterval(this.interval);
        this.updates.clear();
        this.players.forEach((player) => {
            player.resetState();
            player.isMoving = true; // Means that we want to draw a dot before the countdown starts
            this.updates.set(player.userId, player.playerDTO());
        });
        // Initialize countdown
        let count = 3;
        io.in(this.id).emit("countdown", count--);
        this.interval = setInterval(() => {
            if (count <= 0) {
                clearInterval(this.interval);
                io.in(this.id).emit("countdown", count);
                this.startGame(io);
            } else io.in(this.id).emit("countdown", count--);
        }, 1000);
    }

    // Sync client with server every other second
    timeToSync(player) {
        return (player.path.length / 60) % this.syncTime === 0;
    }

    // Start game / round with interval that constantly updates the players
    startGame(io) {
        clearInterval(this.interval);
        io.in(this.id).emit("renderScoreTable", this.playersDTO);
        this.interval = setInterval(() => {
            this.updateAll(io); // Update all players
            // Emit the batched updates at a fixed interval
            let updatedPlayers = Array.from(this.updates.values()); // Turn updated player map values into an array
            if (updatedPlayers.length) {
                // If any updates send it to the client
                io.in(this.id).emit("updatePosition", updatedPlayers);
                this.updates.clear(); // Clear updates for next interval
            } else if (this.mode === "warmUp") {
                // If every player has collided then clear the interval
                let movingPlayers = this.players.filter(
                    (el) => el.isMoving
                ).length;
                if (movingPlayers <= 0) clearInterval(this.interval);
            }
        }, 1000 / 60);
    }

    // Whenever round finishes update scoreboard and reset current score to 0
    roundFinish(io) {
        console.log("Round finished");
        let highestLeaderboardScore = {
            leaderboardScore: 0,
        };
        let highestRoundScore = {
            roundScore: 0,
        };
        for (let i = 0; i < this.players.length; i++) {
            //find highest round score
            if (this.players[i].roundScore >= highestRoundScore.roundScore) {
                highestRoundScore = this.players[i];
            }
            //find highest leaderboard score
            if (
                this.players[i].leaderboardScore >=
                highestLeaderboardScore.leaderboardScore
            ) {
                highestLeaderboardScore = this.players[i];
            }
        }
        //Check if game should end
        if (highestLeaderboardScore.leaderboardScore >= MAX_SCORE) {
            this.endGame(
                io,
                highestLeaderboardScore.username,
                highestLeaderboardScore.color
            );
            return;
        }
        io.in(this.id).emit(
            "roundOver",
            highestRoundScore.username,
            highestRoundScore.color,
            this._rounds
        );
        // Need to reset the roundscore at the end because we are using shallow copies
        this.players.forEach((player) => {
            player.roundScore = 0;
        });
        this.countdown(io);
    }

    endGame(io, winner, color) {
        console.log("Game finished");
        clearInterval(this.interval);
        updateScores(this.players);

        io.in(this.id).emit("gameOver", winner, color);
    }
}

// Genereate the data transfer object that abstracts any irrelevant information for the client
function generateDTO(state) {
    let obj = {};
    obj.userId = state.userId;
    obj.username = state.username;
    obj.x = state.x;
    obj.y = state.y;
    obj.direction = state.direction;
    obj.color = state.color;
    obj.jumps = state.jumps;
    obj.path = state.path;
    obj.collided = state.collided;
    obj.lineWidth = state.lineWidth;
    obj.isJumping = state.isJumping;
    obj.isFlying = state.isFlying;
    obj.isMoving = state.isMoving;
    obj.leaderboardScore = state.leaderboardScore;
    obj.roundScore = state.roundScore;
    return obj;
}

// Generate player instance
function generatePlayer(user, players) {
    let canvas = { width: 1000, height: 1000 };
    return new Player(
        user,
        getColor(players),
        Number((canvas.width * (Math.random() * 0.7 + 0.15)).toFixed(3)),
        Number((canvas.width * (Math.random() * 0.7 + 0.15)).toFixed(3)),
        LINE_WIDTH,
        Number((Math.random() * (3.14 + 3.14 / 2)).toFixed(3)),
        2,
        { ArrowLeft: 0, ArrowRight: 0 },
        canvas
    );
}

// Used to check if two objects are equal (can't just use equality operator)
function areObjectsEqual(obj1, obj2) {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);

    if (obj1Keys.length !== obj2Keys.length) {
        return false;
    }

    for (let key of obj1Keys) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}

// Get the specific color of a line. Needs to be different for every player
function getColor(players) {
    const playerColors = [
        "#32BEFF",
        "#FF6DDE",
        "#FFF116",
        "#B9FF32",
        "#FF6D6D",
        "#0D38D2",
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
        this.turnSpeed = 0.045;
        this.lineWidth = lineWidth;
        this.collided = false;
        this.jumps = [];
        this.jumpFrames = lineWidth * 1.7;
        this.flyFrames = lineWidth * 10;
        this.AccJumpFrames = 0;
        this.jumpChance = 0.0;
        this.jumpFrequency = 0.005;
        this.keyState = keyState;
        this.canvas = canvas;
        this.isJumping = false;
        this.isFlying = true;
        this.isMoving = false;
        this.leaderboardScore = 0;
        this.roundScore = 0;
        this.isConnected = true;
        this.spatialHashTable = {};
    }

    // Data Transfer Object (DTO)
    playerDTO() {
        return generateDTO(this);
    }

    // Update the current player position, check for collision and make jumps
    update(players) {
        if (!this.isMoving) this.isMoving = true;
        this.jumping(); //
        // Update direction based on keyState
        if (this.keyState.ArrowLeft > this.keyState.ArrowRight) {
            this.direction -= this.turnSpeed;
        } else if (this.keyState.ArrowLeft < this.keyState.ArrowRight) {
            this.direction += this.turnSpeed;
        }

        // Update position based on direction and speed
        this.x = Number(
            (this.x + Math.cos(this.direction) * this.speed).toFixed(3)
        );
        this.y = Number(
            (this.y + Math.sin(this.direction) * this.speed).toFixed(3)
        );

        // Add the current position to the path and check collision
        if (!this.isJumping && !this.isFlying) {
            let hashValue = this.hash(this.x, this.y);
            this.hashMapping(hashValue);
            this.collision(players, hashValue);
            this.path.push({ x: this.x, y: this.y });
        }
    }

    hashMapping(hashValue) {
        if (!this.spatialHashTable[hashValue]) {
            this.spatialHashTable[hashValue] = [];
        }
        this.spatialHashTable[hashValue].push({
            x: this.x,
            y: this.y,
        });
    }

    hash(x, y) {
        let cellX = Math.floor(x / CELL_SIZE);
        let cellY = Math.floor(y / CELL_SIZE);
        return cellX + "-" + cellY;
    }

    collision(players, hashValue) {
        // Check if curve hit the wall
        if (!this.isFlying) {
            if (
                this.x < 0 ||
                this.x > this.canvas.width ||
                this.y < 0 ||
                this.y > this.canvas.height
            )
                this.collided = true;

            if (!this.isJumping) {
                // Check if curve hit its own path. Don't check recent points in path since it can collide with them
                // given the current point is close enough. This logic needs to be different for hitting other players
                for (let i = 0; i < players.length; i++) {
                    let player = players[i];
                    let spatialPos = player.spatialHashTable[hashValue];
                    let curPlayer = player.userId === this.userId;
                    if (spatialPos) {
                        for (let i = 0; i < spatialPos.length; i++) {
                            // L2 norm: get shortest distance
                            const distance = Math.sqrt(
                                (spatialPos[i].x - this.x) ** 2 +
                                    (spatialPos[i].y - this.y) ** 2
                            );
                            if (distance < this.lineWidth - 0.1) {
                                if (curPlayer) {
                                    // Check if collided with recent points in path to ensure it doesn't collide with itself instantly.
                                    let recentPath = player.path.slice(
                                        -this.lineWidth
                                    );
                                    recentPath.push({ x: this.x, y: this.y });
                                    if (
                                        recentPath.some((el) =>
                                            areObjectsEqual(el, spatialPos[i])
                                        )
                                    )
                                        break;
                                }
                                this.collided = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    // Check if the player should jump
    jumping() {
        if (this.isFlying || this.isJumping) {
            this.AccJumpFrames++;
        } else {
            let chance = Math.random() * 1;
            if (chance >= 0.992) {
                this.toggleJump();
            }
        }
        if (
            (this.isFlying && this.flyFrames <= this.AccJumpFrames) ||
            (this.isJumping && this.jumpFrames <= this.AccJumpFrames)
        ) {
            this.toggleJump();
        }
    }

    // Start or stop the jump
    toggleJump() {
        if (this.isFlying) this.isFlying = !this.isFlying;
        else {
            this.isJumping = !this.isJumping;
            if (this.isJumping) this.jumps.push(this.path.length);
        }
        this.AccJumpFrames = 0;
    }

    resetState() {
        this.x = Number(
            (this.canvas.width * (Math.random() * 0.7 + 0.15)).toFixed(3)
        );
        this.y = Number(
            (this.canvas.width * (Math.random() * 0.7 + 0.15)).toFixed(3)
        );
        this.direction = Number(
            (Math.random() * (Math.PI + Math.PI / 2)).toFixed(3)
        );
        this.path = [];
        this.collided = false;
        this.jumps = [];
        this.AccJumpFrames = 0;
        this.jumpChance = 0.0;
        this.keyState = { ArrowLeft: 0, ArrowRight: 0 };
        this.isJumping = false;
        this.isFlying = true;
        this.isMoving = false;
        this.roundScore = 0;
        this.spatialHashTable = {};
    }

    disconnect() {
        this.isConnected = false;
    }

    reconnect() {
        this.isConnected = true;
    }
}

const gameStates = new GameStates();

module.exports = {
    gameStates: gameStates,
    Game: Game,
    generatePlayer: generatePlayer,
};
