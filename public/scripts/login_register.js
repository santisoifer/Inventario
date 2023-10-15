const changeToRegister = document.querySelector(".changeToRegister");
const changeToLogin = document.querySelector(".changeToLogin");
const loginForm = document.querySelector("#login-container");
const registerForm = document.querySelector("#register-container");
const loginImg = document.querySelector(".login-img");
const registerImg = document.querySelector(".register-img");

registerForm.setAttribute("hidden", "");
loginForm.removeAttribute("hidden");

changeToRegister.addEventListener("click", function () {
    loginForm.setAttribute("hidden", "");
    registerForm.removeAttribute("hidden");
});

changeToLogin.addEventListener("click", function () {
    registerForm.setAttribute("hidden", "");
    loginForm.removeAttribute("hidden");
});