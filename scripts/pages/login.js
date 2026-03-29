const form = document.querySelector(".login-form");
const toggleText = document.querySelector(".login-or-register");
const nameField = document.getElementById("name");

let isRegister = true;

/*-------------------toggle login/register-------------------*/
toggleText.addEventListener("click", () => {
    isRegister = !isRegister;

    if (isRegister) {
        toggleText.innerText = "Already have an account? Sign in";
        form.querySelector("button").innerText = "Sign up!";
        nameField.parentElement.style.display = "flex";
    } else {
        toggleText.innerText = "Don't have an account? Sign up";
        form.querySelector("button").innerText = "Login";
        nameField.parentElement.style.display = "none";
    }
});

/*-------------------submit form-------------------*/
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameField.value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const url = isRegister
        ? "http://localhost:8080/auth/register"
        : "http://localhost:8080/auth/login";

    const body = isRegister
        ? { name, email, password }
        : { email, password };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Request failed");
        }

        localStorage.setItem("userName", data.name);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("token", data.token);

        alert(isRegister ? "Registered successfully" : "Login successful");

        window.location.href = "../pages/dashboard.html";

    } catch (err) {
        alert(err.message);
    }
});

document.getElementById("googleLoginBtn").addEventListener("click", () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
});