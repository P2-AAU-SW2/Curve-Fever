const versionData = require("../modules/version");
// ErrorHandler.js
const ErrorHandler = (err, req, res, next) => {
    console.log("Middleware Error Handling");
    const errStatus = err.status || 500;
    const errMsg = err.message || "Something went wrong";
    //console.log(err);
    let skinsInFocus = true;
    res.render("index", {
        skinsInFocus,
        user: req.user,
        version: versionData,
        err: err,
    });
    /*
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === "development" ? err.stack : {},
    });
    */
};

module.exports = ErrorHandler;
