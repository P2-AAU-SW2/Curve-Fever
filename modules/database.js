const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { v4: uuidv4 } = require("uuid");

passport.use(
    new LocalStrategy(
        // { usernameField: "username", passwordField: "password" },
        async (username, password, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { name: username },
                });

                // if (!user) {
                //     return done(null, false, {
                //         message: "Invalid username or password",
                //     });
                // }

                const isPasswordValid = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!user || !isPasswordValid) {
                    return done(null, false, {
                        message: "Invalid username or password",
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        // Check if the user ID is for a guest user
        if (id.startsWith("guest-")) {
            const guestNameIndex = id.lastIndexOf("-") + 1;
            const guestName = id.substring(guestNameIndex);
            const guestUser = { id: id, name: guestName };
            done(null, guestUser);
        } else {
            const user = await prisma.user.findUnique({ where: { id: id } });
            done(null, user);
        }
    } catch (err) {
        done(err);
    }
});

exports.createUser = async (req, res, next) => {
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                name: req.body.username,
            },
        });
        if (existingUser) {
            const error = new Error("User already exists");
            error.status = 409;
            error.redirectTo = "/login";
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await prisma.user.create({
            data: {
                name: req.body.username,
                password: hashedPassword,
            },
        });
        console.log(user);

        // authenticate the user
        req.login(user, (err) => {
            if (err) {
                const error = new Error("An error occurred while logging in.");
                error.status = 500;
                error.redirectTo = "/login";
                return next(error);
            }
            res.redirect("/");
        });
    } catch (err) {
        const error = new Error("An error occurred while creating the user.");
        error.status = 500;
        error.redirectTo = "/login";
        return next(error);
    }
};

exports.createGuest = async (req, res, next) => {
    try {
        const guestName = req.body.guestname;

        if (guestName.length < 3) {
            const error = new Error(
                "Guest name must be at least 3 characters long."
            );
            error.status = 400;
            error.redirectTo = "/login";
            return next(error);
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                name: guestName,
            },
        });
        if (existingUser) {
            if (existingUser.id.startsWith("guest-")) {
                const guestUser = {
                    id: existingUser.id,
                    name: guestName,
                    password: "",
                };
                req.login(guestUser, (err) => {
                    if (err) {
                        const error = new Error(
                            "An error occurred while logging in."
                        );
                        error.status = 500;
                        error.redirectTo = "/login";
                        return next(error);
                    }
                    res.redirect("/");
                });
                return;
            }
            //TODO: User exists, so redirect to login with the username
            const error = new Error("User already exists");
            error.status = 409;
            error.redirectTo = "/login";
            return next(error);
        }

        // Generate a unique ID for the guest user
        const guestId = `guest-${uuidv4()}-${guestName}`;

        const guestUser = await prisma.user.create({
            data: {
                id: guestId,
                name: guestName,
                password: "",
            },
        });
        console.log(guestUser);

        req.login(guestUser, (err) => {
            if (err) {
                const error = new Error("An error occurred while logging in.");
                error.status = 500;
                error.redirectTo = "/login";
                return next(error);
            }
            res.redirect("/");
        });
    } catch (err) {
        console.log(err);
        const error = new Error("An error occurred while creating the user.");
        error.status = 500;
        error.redirectTo = "/login";
        return next(error);
    }
};

exports.loginUser = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            const error = new Error("An error occurred while logging in.");
            error.status = 500;
            error.redirectTo = "/login";
            return next(error);
        }

        if (!user) {
            const error = new Error("Invalid username or password");
            error.status = 401;
            error.redirectTo = "/login";
            return next(error);
        }

        req.login(user, (err) => {
            if (err) {
                const error = new Error("An error occurred while logging in.");
                error.status = 500;
                error.redirectTo = "/login";
                return next(error);
            }
            res.redirect("/");
        });
    })(req, res, next);
};

exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            const error = new Error("An error occurred while logging out.");
            error.status = 500;
            error.redirectTo = "/";
            return next(error);
        }
        res.redirect("/login");
    });
};

exports.updateScores = async (players) => {
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        try {
            await prisma.user.update({
                where: {
                    id: player.userId,
                },
                data: {
                    score: {
                        increment: player.leaderboardScore + 1,
                    },
                },
            });
        } catch (err) {
            console.log(err);
        }
    }
};
