const cachedFiles = [
    "*",
    "/index.js",
    "/index.html",
    "/style.css",
    "./models/../database.js"
];

const cacheName = "static-cache";
const dataCacheName = "data-cache";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            return cache.addAll(cachedFiles);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheKeys => {
            return Promise.all(
                cacheKeys.map(key => {
                    if (key != cacheName && key != dataCacheName) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch",  event => {
    if (event.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(dataCacheName).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
            })
        );
        return;
    }
    event.respondWith(
        caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(response => {
                return response;
            });
        })
    );
});
