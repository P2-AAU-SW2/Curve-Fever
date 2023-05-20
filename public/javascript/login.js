function submitSignup() {
    const form = document.getElementById("authForm");
    form.action = "/login/createUser";
    form.method = "post";
    form.submit();
}

function submitLogin() {
    const form = document.getElementById("authForm");
    form.action = "/login/login";
    form.method = "post";
    form.submit();
}

function submitGuest() {
    const form = document.getElementById("guestForm");
    form.action = "/login/guest";
    form.method = "post";
    form.submit();
}
slide = () => {
    const guestName = document.querySelector("#guestname");
    const userName = document.querySelector("#username");
    const pages = document.querySelector(".pages");
    if (!pages.classList.contains("slide-left"))
        userName.value = guestName.value;
    else guestName.value = userName.value;
    pages.classList.toggle("slide-left");
};
