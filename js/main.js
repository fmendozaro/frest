import {DBHelper} from './dbhelper.js';

self.markers = [];

let deferredPrompt;
let btnAdd = document.querySelector('#btnAdd');

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt listening');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
});

btnAdd.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    btnAdd.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
        .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    DBHelper.fetchRestaurants([fetchNeighborhoods, fetchCuisines, updateRestaurants, initMap]);
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
        if (error) { // Got an error!
            toastr.error(`Error getting the list of restaurants ${error}`);
            console.error(error);
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
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    li.tabIndex = 0;

    const image = document.createElement('img');
    image.className = 'restaurant-img';
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
    navigator.serviceWorker.register('/js/sw.js').then((reg) => {
        console.log('ServiceWorker registered');
    }).catch(() => {
        console.log('ServiceWorker not registered');
    });
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