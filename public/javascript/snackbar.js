/*
    The snackbar, is a frontend popup element which shows after the user has been directed to "/", with errors.
*/

function showSnackbar(error) {
    console.log("No snack?");
    let snackbar = document.querySelector("#snackbar");

    snackbar.innerHTML = `${error}`;

    snackbar.className = "show";
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
}
