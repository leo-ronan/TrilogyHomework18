const cachedFiles = [
    "*",
    "/index.js",
    "/index.html",
    "/style.css",
    "/db.js/"
];

var CACHE_NAME = "static-cache";
const DATA_CACHE_NAME = "data-cache";

self.addEventListener("install", event => {
    //
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Cache opened.")
            return cache.addAll(cachedFiles);
        })
    );
});

self.addEventListener("fetch",  event => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                }).catch(err => { return cache.match(event.request); });
            }).catch(err => console.log(err))
        );
        return;
    }
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                return response;
            });
        })
    );
});
