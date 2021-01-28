let db;

const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
//Sends a db request for database "budget"
const request = indexedDB.open("budget", 1);

//Creates object store "pending" and sets autoIncrement to true
request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onerror = ({ event }) => {
    console.log("Error: " + event.errorCode);
};

//Run checkDatabase(), but only if online
request.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
    else {
        console.log("App is offline");
    }
};

function saveRecord(record) {
    //Creates a transaction with readwrite access for the pending db
    const transaction = db.transaction(["pending"], "readwrite");
    //Accesses pending object store
    const store = transaction.objectStore("pending");
    //Adds recird to object store
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    //Save all records from object store
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
            .then(response => {
                return response.json();
            })
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                //Deletes records on success
                store.clear();
            });
        }
    };
}
//Create event listener to detect when back online
window.addEventListener("online", checkDatabase);