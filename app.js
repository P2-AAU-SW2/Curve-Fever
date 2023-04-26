const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const logger = require("morgan");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const socketHandler = require("./modules/socketHandler");
const ErrorHandler = require("./middlewares/errorHandler");

if (process.env.NODE_ENV === "development") {
    console.info("Node is running in development mode");
    // app.use(logger("dev"));
    console.info("Enabling detailed Express logging.");
} else if (process.env.NODE_ENV === "production") {
    console.info("Node is running in production mode");
    app.use(logger("short"));
}

app.set("io", io);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const store = new PrismaSessionStore(new PrismaClient(), {
    checkPeriod: 2 * 60 * 1000, //ms
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
});

//session
app.use(
    session({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // ms
        },
        secret: "curvefever",
        resave: true,
        saveUninitialized: true,
        store: store,
    })
);
app.use(passport.authenticate("session"));

// Routes

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const gameAreaRouter = require("./routes/game");

// Router setup
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/game", gameAreaRouter);
app.use(ErrorHandler);

socketHandler(io);

module.exports = app;
module.exports.store = store;
module.exports.httpServer = httpServer;
