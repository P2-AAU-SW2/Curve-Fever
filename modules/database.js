const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createUser = async (username) => {
    const user = await prisma.user.create({
        data: {
            name: username,
            password: "password",
        },
    });
    console.log(user);
};

// exports.createUser("Karl");
