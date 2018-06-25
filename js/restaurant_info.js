import {DBHelper} from './dbhelper.js';

let restaurant, map;

/**
 * Initialize map, called from HTML.
 */

document.addEventListener('DOMContentLoaded', (event) => {
    initMap();
    DBHelper.checkPendingRequests();
});

let initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.log(error);
        } else {

            let loc = {
                lat: 40.722216,
                lng:-73.987501
            };

            self.map = map = L.map('map').setView(loc, 12);

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                maxZoom: 18,
                id: 'mapbox.streets'
            }).addTo(map);
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, map);
        }
    });
};

/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant);
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        let error = 'No restaurant id in URL';
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
let fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = "restaurant main image";

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML(restaurant.id);
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
let fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (id) => {
    fetch(`${DBHelper.DATABASE_URL}/reviews?restaurant_id=${id}`)
        .then(response => response.json())
        .then(reviews => {

            const container = document.getElementById('reviews-container');

            if (!reviews) {
                const noReviews = document.createElement('p');
                noReviews.innerHTML = 'No reviews yet!';
                container.appendChild(noReviews);
                return;
            }

            const ul = document.getElementById('reviews-list');
            // Clean and refresh the container
            ul.innerHTML = '';
            reviews.forEach(review => {
                ul.appendChild(createReviewHTML(review));
            });
            container.appendChild(ul);
        }).catch( e => {
            toastr.error(`Error getting the list of reviews ${e}`);
        });
};

/**
 * Create review HTML and add it to the webpage.
 */
let createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    const date = document.createElement('span');
    date.setAttribute('id', 'review-date');
    date.innerHTML = new Date(review.createdAt).toLocaleDateString();
    name.innerHTML = review.name + date.outerHTML;
    li.appendChild(name);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
let fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

// Add review

let addReviewBtn = document.querySelector('#addReview');
let addReviewForm = document.querySelector('#add-review-form');

let modal = document.querySelector('#myModal');

let closeModal = document.getElementsByClassName("close")[0];

closeModal.addEventListener('click', () => {
    modal.style.display = "none";
});

addReviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
});

let submitReviewBtn = document.querySelector('#submit-review');

submitReviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let id = getParameterByName('id');
    let nameInput = addReviewForm.querySelector('#name');
    let ratingInput = addReviewForm.querySelector('.rating:checked');
    let commentInput = addReviewForm.querySelector('#comments');

    let data = {
        "restaurant_id": id,
        "name": nameInput.value,
        "rating": ratingInput.value,
        "comments": commentInput.value
    };

    modal.style.display = 'block';

    DBHelper.insertReview(data, (res) => {
        // Hide/close the modal
        modal.style.display = 'none';
        console.log('insertReview', res);
        if(res === null){
            let ul = document.getElementById('reviews-list');
            data.name += ' [Offline review]';
            data.createdAt = new Date().toLocaleDateString();
            ul.appendChild(createReviewHTML(data));
        }else{
            toastr.success('Review saved');
            fillReviewsHTML(id);
            window.scrollTo(0, document.body.scrollHeight);
        }

    });
});

module.exports =  {
    fetchRestaurantFromURL,
    fillRestaurantHTML,
    fillRestaurantHoursHTML,
    fillReviewsHTML,
    createReviewHTML,
    fillBreadcrumb,
    getParameterByName,
    initMap
};