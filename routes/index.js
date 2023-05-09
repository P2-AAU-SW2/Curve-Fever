const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

let skinsInFocus = true; // Determines frontend default value

// GET method to render the index page. ensureAuth is a middleware for authenticating.
router.get("/", ensureAuth, function (req, res) {
    const errorMsg = req.session.errorMessage;
    const errorStatus = req.session.errorStatus;

    console.log("HERE " + errorMsg + errorStatus);
    console.log(req.session);
    req.session.errorMessage = undefined;
    req.session.errorStatus = undefined;

    res.render("index", {
        skinsInFocus, // Frontend default
        user: req.user, // User information, such as username
        version: versionData, // Show the game version
        errorMsg: errorMsg != undefined ? errorMsg : false,
        errorStatus: errorStatus != undefined ? errorStatus : false, // Only pass errors if not undefined
    });
});

module.exports = router;
