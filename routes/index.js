const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

let skinsInFocus = true; // Determines frontend default value

router.get("/", ensureAuth, function (req, res) {
    // Use session to store error data from ErrorHandler on redirect, to be rendered on home screen.
    const error = req.session.error;
    delete req.session.error; // Delete the session data for further use.

    res.render("index", {
        skinsInFocus,
        user: req.user,
        version: versionData,
        error: error ? error : false, // Only if it has a value
    });
});

module.exports = router;
