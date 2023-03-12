const express = require('express');
const router = express.Router();

let version = process.env.npm_package_version;

router.get("/", function (req, res) {
  res.render("loginPage", {
    version
  });
});

module.exports = router;
