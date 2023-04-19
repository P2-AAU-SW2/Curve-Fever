const express = require("express");
const logger = require("morgan");
const path = require("path");
const app = express();

app.use(logger("dev"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const gameMenuRouter = require("./routes/gameMenu");
const gameAreaRouter = require("./routes/gameArea");

// Router setup
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/game-menu", gameMenuRouter);
app.use("/gameArea", gameAreaRouter);

module.exports = app;
