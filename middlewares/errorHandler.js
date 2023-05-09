/* 
ErrorHandler.js - Catches global errors, acting as a middleware. Add's the error message to a session storage
so that i can be used after a redirect @routes/index.js
*/

const ErrorHandler = (err, req, res, next) => {
    // HTTP Status code
    const status = err.status || 500;
    req.session.error.status = 500;

    // Error message
    const msg = err.message || "Something went wrong";
    req.session.error.msg = msg;

    // Redirect path
    const redirectTo = err.redirectTo || "/";

    console.log(
        "ErrorHandler: status: " +
            status +
            " | message: " +
            msg +
            " | redirect to: " +
            redirectTo
    );

    // Redirect
    res.redirect(redirectTo);
};

module.exports = ErrorHandler;
