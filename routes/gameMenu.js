const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

let skinsInFocus = true;

router.get("/", ensureAuth, function (req, res) {
    res.render("gameMenu", { skinsInFocus, user: req.user, version: versionData });
});

module.exports = router;

// const skinsBtn = document.querySelector('.skins-btn');
// const iconsBtn = document.querySelector('.icons-btn');

// skinsBtn.addEventListener('click', () => {
//   skinsInFocus = false
//   console.log(skinsInFocus)
// });

// iconsBtn.addEventListener('click', () => {
//   skinsInFocus = true
//   console.log(skinsInFocus)
// });
