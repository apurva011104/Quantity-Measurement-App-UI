(() => {

    const token = localStorage.getItem("token");

    /*------------------- Protect pages -------------------*/
    if (!token && !window.location.pathname.includes("login.html")) {
        window.location.href = "../pages/login.html";
        return;
    }

    /*------------------- HOME -------------------*/
    const goHome = () => window.location.href = "../pages/dashboard.html";

    document.getElementById("homeBtn")?.addEventListener("click", goHome);
    document.getElementById("homeLink")?.addEventListener("click", goHome);

    /*-------------------  PROFILE -------------------*/
    const goProfile = () => window.location.href = "../pages/profile.html";

    document.getElementById("profileLink")?.addEventListener("click", goProfile);
    document.getElementById("user-icon")?.addEventListener("click", goProfile);

    /*------------------- LOGOUT -------------------*/
    document.getElementById("logoutLink")?.addEventListener("click", async () => {
        try {
            await fetch("http://localhost:8080/auth/logout", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
        } catch (e) {
            console.log("Logout error", e);
        }

        localStorage.clear();
        window.location.href = "../pages/login.html";
    });

})();