'use strict';

import idb from './main-idb.js';

/**
 * Common database helper functions.
 */

export class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        return `http://localhost:1337/restaurants`;
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants() {
        fetch(this.DATABASE_URL).then(response => response.json())
            .then(restaurants => {
                // toastr.success('Restaurant list fetched successfully');
                idb.insert('restaurants', restaurants);
            }).catch(e => {
            toastr.error(`Error getting the list of restaurants ${e}`);
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        const result = idb.selectAll().filter(r => r.id === id);
        console.log('fetchRestaurantById', result);
        callback(null, result);
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        const results = idb.selectAll().filter(r => r.cuisine_type === cuisine);
        console.log('fetchRestaurantByCuisine', results);
        callback(null, results);
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        // DBHelper.fetchRestaurants((error, restaurants) => {
        //     if (error) {
        //         callback(error, null);
        //     } else {
        //         // Filter restaurants to have only given neighborhood
        //         const results = restaurants.filter(r => r.neighborhood == neighborhood);
        //         callback(null, results);
        //     }
        // });
        const results = idb.selectAll().filter(r => r.neighborhood === neighborhood);
        console.log('fetchRestaurantByNeighborhood', results);
        callback(null, results);
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        let results = idb.selectAll();
        console.log('fetchRestaurantByCuisineAndNeighborhood', results);

        if (cuisine !== 'all') { // filter by cuisine
            results = results.filter(r => r.cuisine_type === cuisine);
        }
        if (neighborhood !== 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood === neighborhood);
        }
        console.log('fetchRestaurantByCuisineAndNeighborhood', results);
        callback(null, results);
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        const restaurants = idb.selectAll();
        console.log('fetchNeighborhoods restaurants', restaurants);
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) === i);
        callback(null, uniqueNeighborhoods);
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        const cuisines = idb.selectAll().map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) === i)
        console.log('fetchCuisines', uniqueCuisines);
        callback(null, uniqueCuisines);
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.photograph}.jpg`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            }
        );
        return marker;
    }

}