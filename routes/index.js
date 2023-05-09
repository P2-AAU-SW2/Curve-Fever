const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

let skinsInFocus = true; // Determines frontend default value

// GET method to render the index page. ensureAuth is a middleware for authenticating.
router.get("/", ensureAuth, function (req, res) {
    const errorMsg = req.session.error.msg;
    const errorStatus = req.session.error.status;

    req.session.error = {
        status: undefined,
        msg: undefined,
    }; // Reset the error status, since session is persistent.

    res.render("index", {
        skinsInFocus, // Frontend default
        user: req.user, // User information, such as username
        version: versionData, // Show the game version
        errorMsg: errorMsg != undefined ? errorMsg : false,
        errorStatus: errorStatus != undefined ? errorStatus : false, // Only pass errors if not undefined
    });
});

module.exports = router;
