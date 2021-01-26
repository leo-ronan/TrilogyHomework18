let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", {autoIncrement: true});
};

request.onerror = function(event) {
    console.log("Error: " + event.target.errorCode);
};

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        checkDB();
    }
};

function checkDB() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectScore("pending");
    const getAll = store.getAll();
    getAll.onsuccess = function() {
        let res = getAll.result;
        if (res.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(res),
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