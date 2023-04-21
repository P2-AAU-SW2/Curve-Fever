const express = require("express");
const router = express.Router();
const versionData = require("../modules/version");

router.get("/", function (req, res) {
    res.render("login", { version: versionData });
});

module.exports = router;
