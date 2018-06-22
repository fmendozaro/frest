"use strict";

window.addEventListener('offline', function(e) { toastr.error('Went offline'); });

window.addEventListener('online', function(e) { toastr.success('Back online'); });

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
            '/css/styles.css',
            '/img/1.jpg',
            '/img/2.jpg',
            '/img/3.jpg',
            '/img/4.jpg',
            '/img/5.jpg',
            '/img/6.jpg',
            '/img/7.jpg',
            '/img/8.jpg',
            '/img/9.jpg',
            '/img/10.jpg',
            '/img/bull.png',
            '/img/favicon.ico',
            '/img/placeholder.png',
            '/img/map-placeholder.jpg',
            '/dist/index_bundle.js',
            '/dist/info_bundle.js',
            '/vendor/sweetalert.min.js',
            '/vendor/jquery-3.3.1.min.js',
            '/vendor/toastr.min.css',
            '/vendor/toastr.min.js'
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