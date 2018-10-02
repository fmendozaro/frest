"use strict";

import {DBHelper} from './dbhelper.js';
import lozad from 'lozad';
import styles from '../css/styles.css';

self.markers = [];
let imageCount = 0;
let observer, map;
let location = {
    lat: 40.722216,
    lng:-73.987501
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    // Fetches
    DBHelper.fetchRestaurants([fetchNeighborhoods, fetchCuisines, updateRestaurants]);
    initMap();
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
    self.map = map = new L.map('map').setView(location, 12);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        id: 'mapbox.streets'
    }).addTo(map);
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
    addEventsToHTML();
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    li.tabIndex = 0;

    const favBtn = document.createElement('a');
    let curFav = restaurant.is_favorite == 'true';
    favBtn.innerHTML = (curFav) ? '★': '☆';
    favBtn.className = 'fav-btn';
    favBtn.href = '#';
    favBtn.setAttribute('data-url', '/restaurants/'+ restaurant.id +'/?is_favorite='+ (!curFav));
    favBtn.setAttribute('role', 'link');
    // favBtn.tabIndex = 0;
    li.append(favBtn);

    const image = document.createElement('img');
    image.className = 'restaurant-img lozad';
    image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));
    image.setAttribute('data-id', restaurant.id);
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
    more.setAttribute('aria-label', `View details of ${restaurant.name} restaurant`);
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
    }).catch((e) => {
        console.log('ServiceWorker not registered', e);
    });
}

function startIO(){

    let images = document.querySelectorAll('.lozad');
    observer = lozad(images, {
        load: el => {
            let id = el.getAttribute('data-id');
            el.srcset = `/img/${id}-320w.jpg 320w, /img/${id}-480w.jpg 480w, /img/${id}-800w.jpg 800w`;
            el.sizes = "(max-width: 320px) 280px,(max-width: 480px) 440px,800px";
            el.classList.add('fade-in');
        }
    }); // lazy loads elements with default selector as '.lozad'
    observer.observe();
}

function addEventsToHTML() {
    let favBtns = document.querySelectorAll('.fav-btn');
    favBtns.forEach( (el) => {
        el.addEventListener('click', (event) => {
            event.preventDefault();
            let url = el.getAttribute('data-url');
            DBHelper.favRestaurant(url, restaurant => {
                let curFav = restaurant.is_favorite == 'true';
                el.setAttribute('data-url', '/restaurants/'+ restaurant.id +'/?is_favorite='+ (!curFav));
                el.innerHTML = (curFav) ? '★': '☆';
            });
        })
    });
}

// Non-critical CSS rendering

let loadDeferredStyles = () => {
    let addStylesNode = document.getElementById("deferred-styles");
    let replacement = document.createElement("div");
    replacement.innerHTML = addStylesNode.textContent;
    document.body.appendChild(replacement);
    addStylesNode.parentElement.removeChild(addStylesNode);
};

let showLoading = () => {
    let overlay = document.createElement('div');
    overlay.className = 'loader';
    overlay.createTextNode('Loading...');
};

let raf = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;

if (raf)
    raf(() => { window.setTimeout(loadDeferredStyles, 0); });
else
    window.addEventListener('load', loadDeferredStyles);