const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();

let skinsInFocus = true;

router.get("/", function (req, res) {
    res.render("gameMenu", { skinsInFocus, version: versionData });
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
