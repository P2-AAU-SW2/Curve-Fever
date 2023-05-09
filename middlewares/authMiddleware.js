function ensureAuth(req, res, next) {
    console.log("User before checking for auth:" + req.user);
    if (process.env.NODE_ENV === "production") {
        if (req.isAuthenticated()) {
            // User is authenticated
            console.log("User is authenticated");
            return next();
        } else {
            // User is not authenticated
            const error = new Error("You must be logged in to view this page.");
            error.status = 401;
            error.redirectTo = "/login";
            next(error);
        }
    } else {
        if (req.isAuthenticated()) {
            // User is authenticated
            console.log("User is authenticated");
            return next();
        } else {
            // Log user in to development user
            console.log("Logging in to dev user");
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
                    const error = new Error(
                        "An error occurred while logging in."
                    );
                    error.status = 500;
                    error.redirectTo = "/login";
                    return next(error);
                }
                next(err);
            });
        }
    }
}

module.exports = {
    ensureAuth,
};
