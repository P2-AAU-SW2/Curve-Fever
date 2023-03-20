const express = require('express');
const router = express.Router();

const version = "0.0.1";

router.get("/", function (req, res) {
  console.log*("Here");
  res.render("home")
});

router.get("/login", function (req, res) {
  res.render("home_login")
})



module.exports = router;
