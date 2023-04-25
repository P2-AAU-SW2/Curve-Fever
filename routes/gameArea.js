const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

router.get("/", ensureAuth, function (req, res) {
    res.render("gameAreaPage");
});

module.exports = router;
