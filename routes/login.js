const express = require("express");
const router = express.Router();
const db = require("../modules/database");
const versionData = require("../modules/version");

router.get("/", function (req, res) {
    const error = req.session.error;
    req.session.error = false;

    res.render("login", {
        version: versionData,
        error: error,
    });
});

router.post("/createUser", db.createUser);

router.post("/login", db.loginUser);

router.post("/guest", db.createGuest);

module.exports = router;
