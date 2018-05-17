"use strict";

let staticCacheName = 'frest-v1';
let contentImgsCache = 'frest-content-imgs';
let allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll([
                '/',
                '/img',
                '/data/restaurants.json',
                '/css/styles.css',
                '/js/main.js',
                '/js/restaurant_info.js'
            ]);
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('frest-') &&
                        !allCaches.includes(cacheName);
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {

    let requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        console.log(requestUrl.pathname);
        if (requestUrl.pathname.startsWith('/img/')) {
            event.respondWith(servePhoto(event.request));
            return;
        }

        if (requestUrl.pathname.match('/')){
            event.respondWith(caches.match('/'));
            return;
        }
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );

    fetch(event.request).then((response) => {
        if (response.status === 404) {
            return fetch('/img/404-gif-8.gif')
        }

        return response;
    })

});

function servePhoto(request) {
    let storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

    return caches.open(contentImgsCache).then(function (cache) {
        return cache.match(storageUrl).then(function (response) {
            if (response) return response;

            return fetch(request).then(function (networkResponse) {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}

self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});