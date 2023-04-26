const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { v4: uuidv4 } = require("uuid");

passport.use(
    new LocalStrategy(
        { usernameField: "username", passwordField: "password" },
        async (username, password, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { name: username },
                });

                if (!user) {
                    return done(null, false, {
                        message: "Invalid username or password",
                    });
                }

                const isPasswordValid = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!isPasswordValid) {
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
            console.log("User already exists");
            res.status(409).send("User already exists");
            return;
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
                console.log(err);
                res.status(500).send("An error occurred while logging in.");
                return;
            }
            res.redirect("/");
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while creating the user.");
    }
};

exports.createGuest = async (req, res, next) => {
    try {
        const guestName = req.body.guestname;

        // Generate a unique ID for the guest user
        const guestId = `guest-${uuidv4()}-${guestName}`;

        const guestUser = { id: guestId, name: guestName };

        req.login(guestUser, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send("An error occurred while logging in.");
                return;
            }
            res.redirect("/");
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while creating the user.");
    }
};

exports.loginUser = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
});
