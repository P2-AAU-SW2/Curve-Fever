function ensureAuth(req, res, next) {
    if (process.env.NODE_ENV === "production"){
        if (req.isAuthenticated()) {
            // User is authenticated
            console.log("User is authenticated");
            return next();
        } else {
            // User is not authenticated
            res.redirect("/login");
            console.log("User is not authenticated");
        }
    }else{
        return next();
    }
    
}

module.exports = {
    ensureAuth,
};
