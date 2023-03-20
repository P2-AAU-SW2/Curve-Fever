const express = require('express');
const router = express.Router();

router.get("/", function (req, res) {
  res.render("menuPage");
});

module.exports = router;
