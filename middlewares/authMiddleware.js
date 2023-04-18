function ensureAuth(req, res, next) {
    /* Disabled for dev purposes
    if (req.isAuthenticated()) {
        // User is authenticated
        console.log("User is authenticated");
        return next();
    } else {
        // User is not authenticated
        res.redirect("/login");
        console.log("User is not authenticated");
    }
    */
    return next();
}

module.exports = {
    ensureAuth,
};
