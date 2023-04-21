const express = require("express");
const logger = require("morgan");
const path = require("path");
const app = express();
require("dotenv").config();
const passport = require("passport");
const session = require("express-session");

if (process.env.NODE_ENV === "development") {
    console.info("Node is running in development mode");
    app.use(logger("dev"));
    console.info("Enabling detailed Express logging.");
} else if (process.env.NODE_ENV === "production") {
    console.info("Node is running in production mode");
    app.use(logger("short"));
}

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

//session
app.use(
    session({
        secret: "curvefever",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.authenticate("session"));

// Routes

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
