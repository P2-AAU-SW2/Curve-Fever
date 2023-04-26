function ensureAuth(req, res, next) {
    if (process.env.NODE_ENV === "production") {
        if (req.isAuthenticated()) {
            // User is authenticated
            console.log("User is authenticated");
            return next();
        } else {
            // User is not authenticated
            res.redirect("/login");
            console.log("User is not authenticated");
        }
    } else {
        if (req.isAuthenticated()) {
            // User is authenticated
            console.log("User is authenticated");
            return next();
        } else {
            // Log user in to development user
            console.log("User is not authenticated");
            const devUser = {
                id: "4c1b3248-563f-4e17-b6a5-c6bbe59b0af3",
                name: "Development",
                score: 0,
                coins: 0,
                password:
                    "$2b$10$3eT3gEPvJKsKP0L21eIhpukfXgL9.fCTClpXEYq31YfnW97DN82qu",
            };
            req.login(devUser, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("An error occurred while logging in.");
                    return;
                }
                next();
            });
        }
    }
}

module.exports = {
    ensureAuth,
};
