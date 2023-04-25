const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");
const gameController = require("../controllers/gameController");

router.get("/", ensureAuth, function (req, res) {
    res.render("gameAreaPage");
});

router.get("/play", ensureAuth, gameController.play);

router.get("/join/:id", ensureAuth, gameController.joinGameById);

router.get("/create", ensureAuth, gameController.createGame);

router.get("/:id", ensureAuth, gameController.getGameById);

module.exports = router;
