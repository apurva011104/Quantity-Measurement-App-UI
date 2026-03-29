const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../pages/login.html";
}

/*------------------- USER INFO -------------------*/
document.getElementById("profileName").innerText = localStorage.getItem("userName");
document.getElementById("profileEmail").innerText = localStorage.getItem("userEmail");

const historyList = document.getElementById("historyList");
const filter = document.getElementById("filter");

/*------------------- LOAD HISTORY -------------------*/
async function loadHistory(operationType = "") {
    try {
        let url = "http://localhost:8080/quantities/operationsHistory";

        if (operationType) {
            url += `/${operationType}`;
        }

        const res = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        renderHistory(data);

    } catch (err) {
        historyList.innerText = "Error loading history";
    }
}

/*------------------- RENDER HISTORY -------------------*/
function renderHistory(data) {
    historyList.innerHTML = "";

    if (!data.length) {
        historyList.innerText = "No history found";
        return;
    }

    data.forEach(item => {
        let w = (item.operand2==null || item.operand2==="")?"":"OPERAND 2:";
        const div = document.createElement("div");
        div.className = "history-item";
        
        div.innerHTML = `
            <div class="history-left">
                <span><b>OPERATION: ${item.operationType}</b></span>
                <span>OPERAND1: ${item.operand1}</span>
                <span>${w} ${item.operand2 || ""}</span>
                <span><b>RESULT: ${item.result}</b></span>
            </div>
        `;

        historyList.appendChild(div);
    });
}

/*------------------- FILTER CHANGE -------------------*/
filter.addEventListener("change", () => {
    loadHistory(filter.value);
});

/*------------------- LOGOUT -------------------*/
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    localStorage.clear();
    window.location.href = "../pages/login.html";
});

/*------------------- INITIAL LOAD -------------------*/
loadHistory();