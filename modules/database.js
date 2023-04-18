const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

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
        res.redirect("/game-menu");
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while creating the user.");
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                name: req.body.username,
            },
        });
        if (!user) {
            console.log("User not found");
            res.status(401).send("Invalid username or password");
            return;
        }

        const isPasswordValid = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!isPasswordValid) {
            console.log("Invalid password");
            res.status(401).send("Invalid username or password");
            return;
        }

        //TODO: Create session/token/cookie

        res.redirect("/game-menu");
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while logging in.");
    }
};

// exports.createUser("Karl");
