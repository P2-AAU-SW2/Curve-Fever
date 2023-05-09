/*
    The snackbar, is a frontend popup element which shows after the user has been directed to "/", with errors.
*/

document.addEventListener("DOMContentLoaded", () => {
    if (errorMsg != "false") {
        showSnackbar(errorMsg, errorStatus);
    }
});

function showSnackbar(message, status) {
    let snackbar = document.querySelector("#snackbar");

    // Check if a HTTP status code is provided, else just show the message.
    if (status != undefined) {
        snackbar.innerHTML = `${status} | ${message}`;
    } else {
        snackbar.innerHTML = `${message}`;
    }

    // Add the show class to the snackbar element
    snackbar.className = "show";

    // Remove the snackbar after a set timeout
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
    }, 6000);
}
