const express = require("express");
const router = express.Router();
const db = require("../modules/database");
const versionData = require("../modules/version");

router.get("/", function (req, res) {
    res.render("login", { version: versionData });
});

router.post("/createUser", db.createUser);

router.post("/login", db.loginUser);

router.post("/guest", db.createGuest);

module.exports = router;
