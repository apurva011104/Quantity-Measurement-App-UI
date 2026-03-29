const params = new URLSearchParams(window.location.search);

const tokenFromUrl = params.get("token");
const nameFromUrl = params.get("name");
const emailFromUrl = params.get("email");

if (tokenFromUrl) {
    localStorage.setItem("token", tokenFromUrl);
    localStorage.setItem("userName", nameFromUrl);
    localStorage.setItem("userEmail", emailFromUrl);

    window.history.replaceState({}, document.title, window.location.pathname);
}

const operationsEl = document.getElementById("operations");
const categoriesEl = document.getElementById("categories");
const inputSection = document.getElementById("inputSection");
const unit1 = document.getElementById("unit1");
const unit2 = document.getElementById("unit2");
const targetUnit = document.getElementById("targetUnit");
const targetUnitRow = document.getElementById("targetUnitRow");
const secondInput = document.getElementById("secondInput");
const resultEl = document.getElementById("result");

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../pages/login.html";
}

const name = localStorage.getItem("userName");
document.getElementById("welcomeText").innerText = `Welcome, ${name}`;

let selectedOperation = "";
let selectedCategory = "";

/*------------------- OPERATION MAP -------------------*/
const opMap = {
    COMPARE: "equals",
    CONVERT: "convert",
    ADD: "add",
    SUBTRACT: "subtract",
    DIVIDE: "divide"
};

/*------------------- MEASUREMENT TYPE MAP -------------------*/
const measurementMap = {
    LENGTH: "LengthUnit",
    WEIGHT: "WeightUnit",
    VOLUME: "VolumeUnit",
    TEMPERATURE: "TemperatureUnit"
};

/*------------------- UNITS -------------------*/
const units = {
    LENGTH: ["FEET", "INCHES", "YARDS", "CENTIMETERS"],
    WEIGHT: ["KILOGRAMS", "GRAMS", "POUNDS"],
    VOLUME: ["GALLON", "LITRE", "MILLILITRE"],
    TEMPERATURE: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
};

/*------------------- OPERATION CLICK -------------------*/
operationsEl.addEventListener("click", (e) => {
    if (!e.target.classList.contains("card-btn")) return;

    selectedOperation = opMap[e.target.innerText];

    selectedCategory = "";
    resetUI();

    renderCategories();
});

/*------------------- RENDER CATEGORIES -------------------*/
function renderCategories() {
    categoriesEl.innerHTML = "";

    const base = ["LENGTH", "WEIGHT", "VOLUME"];
    if (selectedOperation === "equals" || selectedOperation === "convert") {
        base.push("TEMPERATURE");
    }

    base.forEach(cat => {
        const div = document.createElement("div");
        div.className = "card-btn";
        div.innerText = cat;
        categoriesEl.appendChild(div);
    });
}

/*------------------- CATEGORY CLICK -------------------*/
categoriesEl.addEventListener("click", (e) => {
    if (!e.target.classList.contains("card-btn")) return;

    selectedCategory = e.target.innerText;

    resetUI();
    setupInputs();
});

/*------------------- SETUP INPUTS -------------------*/
function setupInputs() {
    inputSection.classList.remove("hidden");

    unit1.innerHTML = "";
    unit2.innerHTML = "";
    targetUnit.innerHTML = "";

    units[selectedCategory].forEach(u => {
        unit1.innerHTML += `<option>${u}</option>`;
        unit2.innerHTML += `<option>${u}</option>`;
        targetUnit.innerHTML += `<option>${u}</option>`;
    });

    targetUnit.value = unit1.value;

    if (selectedOperation === "convert") {
        secondInput.classList.add("hidden");
        targetUnitRow.classList.remove("hidden");
    } 
    else if (selectedOperation === "add" || selectedOperation === "subtract") {
        secondInput.classList.remove("hidden");
        targetUnitRow.classList.remove("hidden");
    } 
    else {
        secondInput.classList.remove("hidden");
        targetUnitRow.classList.add("hidden");
    }
}

unit1.addEventListener("change", () => {
    targetUnit.value = unit1.value;
});

/*------------------- PERFORM -------------------*/
document.getElementById("performBtn").addEventListener("click", async () => {
    const v1 = parseFloat(document.getElementById("value1").value);
    const u1 = unit1.value;

    const v2 = parseFloat(document.getElementById("value2").value);
    const u2 = unit2.value;

    const target = targetUnit.value;

    if (!v1 || (selectedOperation !== "convert" && !v2)) {
        resultEl.innerText = "⚠️ Please enter valid values";
        return;
    }

    let url = `http://localhost:8080/quantities/${selectedOperation}`;
    let body;

    if (selectedOperation === "convert") {

        if (target) {
            url += `?targetUnit=${target}`;
        }

        body = {
            quantityValue: v1,
            unit: u1,
            measurementType: measurementMap[selectedCategory]
        };
    } 
    else {
        
        if ((selectedOperation === "add" || selectedOperation === "subtract") && target) {
            url += `?targetUnit=${target}`;
        }

        body = {
            quantity1: {
                quantityValue: v1,
                unit: u1,
                measurementType: measurementMap[selectedCategory]
            },
            quantity2: {
                quantityValue: v2,
                unit: u2,
                measurementType: measurementMap[selectedCategory]
            }
        };
    }

    try {
        resultEl.innerText = "Calculating..."; 

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(body)
        });

        const text = await res.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        if (!res.ok) {
            let errorMsg = "Something went wrong";

            if (typeof data === "object") {
                errorMsg = data.message || data.error || JSON.stringify(data);
            } else if (typeof data === "string") {
                errorMsg = data;
            }

            throw new Error(errorMsg);
        }

        /*------------------- RESULT DISPLAY -------------------*/
        if (typeof data === "object") {
            if (data.value !== undefined) {
                resultEl.innerText = `Result: ${Number(data.value).toFixed(2)} ${data.unit}`;
            } else {
                resultEl.innerText = JSON.stringify(data);
            }
        } else {
            resultEl.innerText = `Result: ${data}`;
        }

    } catch (err) {
        resultEl.innerText = "Error: " + err.message;
    }
});

/*------------------- LOGOUT -------------------*/
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await fetch("http://localhost:8080/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        localStorage.clear();
        window.location.href = "../pages/login.html";
    });
}

/*------------------- RESET UI -------------------*/
function resetUI() {
    inputSection.classList.add("hidden");
    secondInput.classList.remove("hidden");
    targetUnitRow.classList.add("hidden");

    document.getElementById("value1").value = "";
    document.getElementById("value2").value = "";

    unit1.innerHTML = "";
    unit2.innerHTML = "";
    targetUnit.innerHTML = "";

    resultEl.innerText = "---";
}