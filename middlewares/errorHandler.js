/* 
ErrorHandler.js - Catches global errors, acting as a middleware. Add's the error message to a session storage
so that i can be used after a redirect @routes/index.js
*/

const ErrorHandler = (err, req, res, next) => {
    const errStatus = err.status || 500;
    const errMsg = err.message || "Something went wrong";

    req.session.error = errMsg;

    console.log("ErrorHandler: " + errStatus + " | " + errMsg);
    res.redirect("/");
};

module.exports = ErrorHandler;
