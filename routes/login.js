var express = require('express');
var router = express.Router();

router.get("/", function (req, res) {
  res.render("login/loginPage");
});

module.exports = router;
