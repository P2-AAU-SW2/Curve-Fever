const express = require("express");
const router = express.Router();
const db = require("../modules/database");

router.get("/", function (req, res) {
    res.render("login");
});

router.post("/createUser", db.createUser);

router.post("/login", db.loginUser);

module.exports = router;
