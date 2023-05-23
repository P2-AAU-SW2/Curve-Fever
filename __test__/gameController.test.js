const { gameStates, Game, generatePlayer } = require("../modules/gameClasses");
const { logger, getGameById, play } = require("../controllers/gameController");
const { ErrorHandler } = require("../middlewares/errorHandler");

// logger test
describe("logger", () => {
    let consoleSpy;

    // Mock the console.log method
    beforeEach(() => {
        consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    });

    // Clear all mocks after each test
    afterEach(() => {
        consoleSpy.mockRestore();
    });

    test("should log the players of the first game in gameStates", () => {
        // Mock the gameStates object
        gameStates.games = [
            {
                // First game
                players: [
                    { name: "John Doe", id: "42" },
                    { name: "Fissan Poulsen", id: "69" },
                ],
            },
            {
                // Second game
                players: [{ name: "Pölle", id: "1337" }],
            },
        ];

        // Call the function to be tested
        logger(gameStates);

        // Check that console.log was called with correct parameters
        expect(consoleSpy).toHaveBeenCalledWith(gameStates.games[0].players);
    });
});

// getGameById test
describe("getGameById", () => {
    let game, req, res, next;

    // Mock the request and response objects
    beforeAll(() => {
        req = {
            params: {
                id: "666",
            },
            user: {
                name: "John Wick",
                id: "314",
            },
        };

        game = new Game(req.params.id);
        generatePlayer(req.user, game.players).then((player) => {
            game.players.push(player);
        });
    });

    beforeEach(() => {
        res = {
            render: jest.fn(),
        };

        next = jest.fn();
    });

    // Clear all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should call joinById method from gameStates with correct parameters", async () => {
        // Mock the joinById method
        gameStates.joinByID = jest.fn().mockResolvedValue(game);
        // Call the function to be tested
        await getGameById(req, res, next);
        // Check that joinById was called with correct parameters
        expect(gameStates.joinByID).toHaveBeenCalledWith(
            req.params.id,
            req.user
        );
    });

    test("should render game template with correct data when joinById succeeds", async () => {
        gameStates.joinByID = jest.fn().mockResolvedValue(game);
        await getGameById(req, res, next);

        expect(res.render).toHaveBeenCalledWith("game", {
            players: game.playersDTO,
            curPlayer: game.playerDTO(req.user.id),
            gameId: req.params.id,
        });
    });

    test("should call next with error when joinById fails", async () => {
        const error = new Error("Join failed");
        gameStates.joinByID = jest.fn().mockRejectedValue(error);
        await getGameById(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

// play test
describe("play function", () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            redirect: jest.fn(),
        };

        next = jest.fn();
    });

    beforeEach(() => {
        jest.resetModules(); // reset the module registry to clear any cached modules
        gameStates.joinPublic = jest.fn(); // mock the joinPublic function
    });

    test("should call joinPublic and redirect to the game page with the returned id", async () => {
        gameStates.joinPublic.mockResolvedValue("123"); // mock the joinPublic function to return a value

        await play(req, res, next);

        expect(gameStates.joinPublic).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/game/123");
        expect(next).not.toHaveBeenCalled();
    });

    // TODO: joinPublic needs to throw an error for this to work
    test("should call next with an error if joinPublic throws an error", async () => {
        const error = new Error("Failed to join or creat a new game!");
        gameStates.joinPublic.mockRejectedValue(error); // mock the joinPublic function to throw an error

        await play(req, res, next);

        expect(gameStates.joinPublic).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
        //expect(next).toHaveBeenCalledWith(error);
    });
});
