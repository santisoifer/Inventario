const changeToRegister = document.querySelector(".changeToRegister");
const changeToLogin = document.querySelector(".changeToLogin");
const loginForm = document.querySelector("#login-container");
const registerForm = document.querySelector("#register-container");

// registerForm.setAttribute("hidden", "");
// loginForm.removeAttribute("hidden");

changeToRegister.addEventListener("click", function(e) {
    loginForm.setAttribute("hidden", "");
    registerForm.removeAttribute("hidden");
});

changeToLogin.addEventListener("click", function(e) {
    registerForm.setAttribute("hidden", "");
    loginForm.removeAttribute("hidden");
});