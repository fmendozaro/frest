"use strict";

let staticCacheName = 'frest-v1';
let contentImgsCache = 'frest-content-imgs';
let allCaches = [
    staticCacheName,
    contentImgsCache
];

self.addEventListener('install', event => {

    caches.open(staticCacheName).then( cache => {
        return cache.addAll([
            '.',
            '/index.html',
            '/restaurant.html',
            '/img/1-320w.jpg',
            '/img/1-480w.jpg',
            '/img/1-800w.jpg',
            '/img/2-320w.jpg',
            '/img/2-480w.jpg',
            '/img/2-800w.jpg',
            '/img/3-320w.jpg',
            '/img/3-480w.jpg',
            '/img/3-800w.jpg',
            '/img/4-320w.jpg',
            '/img/4-480w.jpg',
            '/img/4-800w.jpg',
            '/img/5-320w.jpg',
            '/img/5-480w.jpg',
            '/img/5-800w.jpg',
            '/img/6-320w.jpg',
            '/img/6-480w.jpg',
            '/img/6-800w.jpg',
            '/img/7-320w.jpg',
            '/img/7-480w.jpg',
            '/img/7-800w.jpg',
            '/img/8-320w.jpg',
            '/img/8-480w.jpg',
            '/img/8-800w.jpg',
            '/img/9-320w.jpg',
            '/img/9-480w.jpg',
            '/img/9-800w.jpg',
            '/img/10-320w.jpg',
            '/img/10-480w.jpg',
            '/img/10-800w.jpg',
            '/img/map-placeholder-320w.jpg',
            '/img/map-placeholder-480w.jpg',
            '/img/map-placeholder-800w.jpg',
            '/img/bull.png',
            '/img/favicon.ico',
            '/img/placeholder.png',
            '/dist/index_bundle.js',
            '/dist/info_bundle.js',
            '/node_modules/toastr/build/toastr.min.js'
        ]);
    })

});

self.addEventListener('activate', function (event) {

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            console.log('activated');
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

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                }
            )
    );

});

self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});