const express = require("express");
const versionData = require("../modules/version");
const router = express.Router();
const { ensureAuth } = require("../middlewares/authMiddleware");

let skinsInFocus = true;

router.get("/", ensureAuth, function (req, res) {
    let user;
    if(req.user){
        user = req.user
    } else {
        user = {
            name: "Development"
        }
    }
    res.render("gameMenu", { skinsInFocus, user: user, version: versionData });
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
