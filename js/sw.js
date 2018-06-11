"use strict";

// import idb from 'main-idb.js';

let staticCacheName = 'frest-v1';
let contentImgsCache = 'frest-content-imgs';
let allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', event => {

    caches.open(staticCacheName).then( cache => {
        console.log('Opened cache');
        return cache.addAll([
            '/',
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
            '/dist/index_bundle.js',
            '/dist/info_bundle.js',
            '/dist/sw_bundle.js',
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
    console.log('fetched');
    let requestUrl = new URL(event.request.url);

    console.log(event);
    console.log(event.request);
    console.log(event.response);
    console.log(requestUrl);

    // if (requestUrl.origin === location.origin) {
    //     if (requestUrl.pathname === '/') {
    //         event.respondWith(caches.match('/index.html'));
    //         return;
    //     }
    // }
    //


    // if (requestUrl.origin === location.origin) {
    //     console.log(requestUrl.pathname);
    //     if (requestUrl.pathname.startsWith('/img/')) {
    //         event.respondWith(servePhoto(event.request));
    //         return;
    //     }
    //
    //     if (requestUrl.pathname.match('/')){
    //         event.respondWith(caches.match('/'));
    //         return;
    //     }
    // }

    event.respondWith(
        caches.match(event.request).then( response => {

            toastr.error('Unable to connect');

            if(response){
                return response;
            }

            let fetchRequest = event.request.clone();

            return fetch(fetchRequest).then( response => {
                console.log(response);

                if(!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                if (response.status === 404) {
                    return fetch('/img/404-gif-8.gif')
                }

                let responseToCache = response.clone();

                caches.open(staticCacheName).then( cache => {
                    cache.put(event.request, responseToCache);
                });

                return response;

            }).catch( () => {
                return new Response("Something totally failed");
            });

        })
    );

});
//
// function servePhoto(request) {
//     let storageUrl = request.url.replace(/-\d+px\.jpg$/, '');
//
//     return caches.open(contentImgsCache).then(function (cache) {
//         return cache.match(storageUrl).then(function (response) {
//             if (response) return response;
//
//             return fetch(request).then(function (networkResponse) {
//                 cache.put(storageUrl, networkResponse.clone());
//                 return networkResponse;
//             });
//         });
//     });
// }
//
self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});