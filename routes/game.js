// Module import
const express = require("express");
const router = express.Router();

// Custom file import
const { ensureAuth } = require("../middlewares/authMiddleware");
const gameController = require("../controllers/gameController");

// Routes
router.get("/play", ensureAuth, gameController.play); // Request a current or new game. Redirects to /play/:id
router.get("/play/:id", ensureAuth, gameController.play); // Join the game with an ID.

router.get("/:id", ensureAuth, gameController.getGameById); // Actually responsible for viewing the game page

module.exports = router;
