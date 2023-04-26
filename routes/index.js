const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

let skinsInFocus = true;

router.get("/", ensureAuth, function (req, res) {
    const error = req.session.error;
    console.log(error);
    req.session.destroy();
    res.render("index", {
        skinsInFocus,
        user: req.user,
        version: versionData,
        err: error ? error : false,
    });
});

module.exports = router;
