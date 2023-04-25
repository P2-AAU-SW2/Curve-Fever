const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

let skinsInFocus = true;

router.get("/", ensureAuth, function (req, res) {
    let user;
    if (req.user) {
        user = req.user;
    } else {
        user = {
            name: "Development",
        };
    }
    res.render("gameMenu", { skinsInFocus, user: user, version: versionData });
});

module.exports = router;
