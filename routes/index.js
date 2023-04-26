const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

let skinsInFocus = true;

router.get("/", ensureAuth, function (req, res) {
    console.log(req.user);
    res.render("index", {
        skinsInFocus,
        user: req.user,
        version: versionData,
        err: undefined,
    });
});

module.exports = router;
