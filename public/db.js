let db;

const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
//Sends a db request for database "budget"
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onerror = ({ event }) => {
    console.log("Error: " + event.errorCode);
};

request.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
    else {
        console.log("App is offline");
    }
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectScore("pending");
    const getAll = store.getAll();
    getAll.onsuccess = function() {
        let res = getAll.result;
        if (res.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: res,
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    }
}

function save(data) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectScore("pending");
    store.add(data);
}

window.addEventListener("online", checkDB);