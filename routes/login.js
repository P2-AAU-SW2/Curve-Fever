const express = require('express');
const router = express.Router();

const version = "0.0.1";

router.get("/", function (req, res) {
  res.render("loginPage", {
    version
  });
});

module.exports = router;
