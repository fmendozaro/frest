"use strict";

import idb from 'idb';

const dbPromise = idb.open('frest-db', 1, upgradeDb => {
    let store = upgradeDb.createObjectStore('keyval');
});

const insert = (key, val) => {
    dbPromise.then(db => {
        let tx = db.transaction('keyval', 'readwrite');
        let keyValStore = tx.objectStore('keyval');
        keyValStore.put(val, key);
        return tx.complete;
    }).then(() => {
        console.log(`Added ${key}:${val} to keyval`);
    }).catch(e => {
        toastr.error(`Error inserting the list of restaurants in DB ${e}`);
    });
};

const selectAll = (callback) => {
    dbPromise.then(db => {
        return db.transaction('keyval').objectStore('keyval').getAll();
    }).then(allObjs => {
        callback(allObjs[0]);
    }).catch( e => {
        toastr.error(`Error getting the list of restaurants from DB ${e}`);
    });
};

module.exports = {
    dbPromise,
    insert,
    selectAll
};