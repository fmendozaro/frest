'use strict';

import idb from './main-idb.js';

/**
 * Common database helper functions.
 */

let isOnline=true;

window.addEventListener('offline', e => {
    isOnline=false;
    toastr.error('Went offline');
});

window.addEventListener('online', e => {
    isOnline=true;
    toastr.success('Back online');
    this.checkPendingRequests();
});

const toastr = {
    success: (msg) => {
        console.log(msg);
    },
    warning: (msg) => {
        console.info(msg);
    },
    error: (msg) => {
        console.error(msg);
    }
};

export class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        return 'https://frest.glitch.me';
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callbackArray) {
        console.log('isOnline', isOnline);
        idb.selectAll( restaurants => {
            if(restaurants === undefined || isOnline){

                if(isOnline)
                    idb.removeKey('restaurants');

                fetch(this.DATABASE_URL+'/restaurants').then(response => response.json())
                    .then(restaurants => {
                        idb.insert('restaurants', restaurants);
                        callbackArray.forEach( fx => {
                            fx();
                        });
                    }).catch(e => {
                        toastr.error(`Error getting the list of restaurants DBHELPER ${e}`);
                });
            }else{
                callbackArray.forEach( fx => {
                    fx();
                });
            }
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        idb.selectAll(restaurants => {
            let restaurant = restaurants.filter(r => r.id == id)[0];
            callback(null, restaurant);
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        idb.selectAll( restaurants => {
            restaurants.filter(r => r.cuisine_type === cuisine);
            callback(null, restaurants);
        })
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        idb.selectAll( restaurants => {
            restaurants.filter(r => r.neighborhood === neighborhood);
            callback(null, restaurants);
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        idb.selectAll( restaurants =>  {
            if (cuisine !== 'all') { // filter by cuisine
                restaurants = restaurants.filter(r => r.cuisine_type === cuisine);
            }
            if (neighborhood !== 'all') { // filter by neighborhood
                restaurants = restaurants.filter(r => r.neighborhood === neighborhood);
            }
            callback(null, restaurants);
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        idb.selectAll( restaurants => {
            const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
            const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) === i);
            callback(null, uniqueNeighborhoods);
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        idb.selectAll( restaurants => {
            let cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
            // Remove duplicates from cuisines
            let uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) === i);
            callback(null, uniqueCuisines);
        });
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
        if(restaurant.photograph !== undefined)
            return (`/img/${restaurant.photograph}.jpg`);
        else
            return ('/img/placeholder.png');
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        let marker = L.marker(restaurant.latlng).addTo(map);
        marker.bindPopup(`${restaurant.name} <br> <a href="${DBHelper.urlForRestaurant(restaurant)}">More info</a>`).openPopup();
        return marker;
    }

    static insertReview(data, callback){
        fetch(`${this.DATABASE_URL}/reviews`, {
            body: JSON.stringify(data),
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }
        }).then( response => response.json())
            .then( res => {
                callback(res);
            }).catch( e => {
                toastr.warning('You seem to be offline, we will try to post the review once your are reconnected');
                idb.insert('pending_request', data);
                callback(null);

            });
    }

    static checkPendingRequests(){
        idb.getPendingRequests( pendingReview => {
            console.log('pendingReview', pendingReview);
            this.insertReview(pendingReview, () => {
                toastr.success('Pending offline request posted');
                idb.removeKey('pending_request');
            });
        });
    }

    static favRestaurant(url, callback){
        fetch(this.DATABASE_URL + url, {
            method: 'PUT'
        }).then( response => response.json())
            .then( res => {
                callback(res);
                toastr.success('Changes saved');
            }).catch( error => {
                toastr.error('An error occurred while trying to fav a restaurant', error);
                //idb.insert('pending_request', data);
        });
    }

}