const versionData = require("../modules/version");

// ErrorHandler.js
const ErrorHandler = (err, req, res, next) => {
    const errStatus = err.status || 500;
    const errMsg = err.message || "Something went wrong";

    //req.session.error = errMsg;

    console.log("ErrorHandler: " + errStatus + " | " + errMsg);
    res.redirect("/");
};

module.exports = ErrorHandler;
