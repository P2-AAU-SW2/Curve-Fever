const express = require("express");
const router = express.Router();
const db = require("../modules/database");
const versionData = require("../modules/version");

// GET method to render the login page.
router.get("/", function (req, res) {
    const errorMsg = req.session.errorMessage;
    const errorStatus = req.session.errorStatus;

    req.session.errorMessage = undefined;
    req.session.errorStatus = undefined;

    res.render("login", {
        version: versionData, // Pass the version of our program
        errorMsg: errorMsg != undefined ? errorMsg : false,
        errorStatus: errorStatus != undefined ? errorStatus : false, // Only pass errors if not undefined
    });
});

// POST method for signing up
router.post("/createUser", db.createUser);

// POST method for logging in
router.post("/login", db.loginUser);

// POST method to play as guest
router.post("/guest", db.createGuest);

module.exports = router;
