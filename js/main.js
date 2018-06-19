import {DBHelper} from './dbhelper.js';
import lozad from 'lozad';

self.markers = [];
let imageCount = 0;
let observer;

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    // Fetches
    DBHelper.fetchRestaurants([fetchNeighborhoods, fetchCuisines, updateRestaurants, initMap]);
    DBHelper.checkPendingRequests();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Initialize map, called from HTML.
 */
let initMap = () => {

    let loc = {
        lat: 40.722216,
        lng:-73.987501
    };

    self.map = L.map('map').setView(loc, 12);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(self.map);
};

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) {
            toastr.error(`Error getting the list of restaurants ByCuisineAndNeighborhood ${error}`);
        } else {
            self.restaurants = restaurants;
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    })
};

window.updateRestaurants = updateRestaurants;

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    self.restaurants = restaurants;
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    if(self.markers){
        self.markers.forEach(m => m.remove());
        self.markers = [];
    }
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    startIO();
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    li.tabIndex = 0;

    const image = document.createElement('img');
    image.className = 'restaurant-img lozad';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = "restaurant main image";
    li.append(image);

    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    more.setAttribute('role', 'link');
    more.tabIndex = 0;
    li.append(more);

    return li;
};

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        let marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        self.markers.push(marker);
    });
};

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js').then((reg) => {
        console.log('ServiceWorker registered');
    }).catch(() => {
        console.log('ServiceWorker not registered');
    });
}

function startIO(){

    let images = document.querySelectorAll('.lozad');
    observer = lozad(images, {
        load: el => {
            console.log('loading element', el);
            el.classList.add('fade-in');

        }
    }); // lazy loads elements with default selector as '.lozad'
    observer.observe();

//     let ioConfig = {
//         root: null,
//         rootMargin: '50px 0',
//         threshold: [0]
//     };
//
//     let images = document.querySelectorAll('.js-lazy-image');
//     imageCount = images.length;
//
// // If we don't have support for intersection observer, loads the images immediately
//     if (!('IntersectionObserver' in window)) {
//         console.error('no IntersectionObserver');
//         loadImagesImmediately(images);
//     } else {
//         // It is supported, load the images
//         observer = new IntersectionObserver(onIntersection, ioConfig);
//         // foreach() is not supported in IE
//         for (let i = 0; i < images.length; i++) {
//             let image = images[i];
//             if (image.classList.contains('js-lazy-image--handled')) {
//                 continue;
//             }
//
//             observer.observe(image);
//         }
//     }
}

/**
 * Fetchs the image for the given URL
 * @param {string} url
 */
function fetchImage(url) {
    console.log('fetchImage url ', url);
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = resolve;
        image.onerror = reject;
    });
}

/**
 * Preloads the image
 * @param {object} image
 */
function preloadImage(image) {
    const src = image.src;
    if (!src) {
        return;
    }

    return fetchImage(src).then(() => { applyImage(image, src); });
}

/**
 * Load all of the images immediately
 * @param {NodeListOf<Element>} images
 */
function loadImagesImmediately(images) {
    // foreach() is not supported in IE
    for (let i = 0; i < images.length; i++) {
        let image = images[i];
        preloadImage(image);
    }
}

/**
 * Disconnect the observer
 */
function disconnect() {
    if (!observer) {
        return;
    }

    observer.disconnect();
}

/**
 * On intersection
 * @param {array} entries
 */
function onIntersection(entries) {
    // Disconnect if we've already loaded all of the images
    if (imageCount === 0) {
        observer.disconnect();
    }

    // Loop through the entries
    for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        // Are we in viewport?
        if (entry.intersectionRatio > 0) {
            imageCount--;

            // Stop watching and load the image
            observer.unobserve(entry.target);
            preloadImage(entry.target);
        }
    }
}

/**
 * Apply the image
 * @param {object} img
 * @param {string} src
 */
function applyImage(img, src) {
    // Prevent this from being lazy loaded a second time.
    img.classList.add('js-lazy-image--handled');
    img.src = src;
    img.classList.add('fade-in');
}

module.exports = {
    fetchNeighborhoods,
    fillNeighborhoodsHTML,
    fetchCuisines,
    fillCuisinesHTML,
    updateRestaurants,
    resetRestaurants,
    fillRestaurantsHTML,
    createRestaurantHTML,
    addMarkersToMap
};