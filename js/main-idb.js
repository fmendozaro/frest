"use strict";

import idb from 'idb';

const dbPromise = idb.open('frest-db', 1, upgradeDb => {
    upgradeDb.createObjectStore('keyval');
});

const insert = (key, val) => {
    dbPromise.then(db => {
        let tx = db.transaction('keyval', 'readwrite');
        let keyValStore = tx.objectStore('keyval');
        keyValStore.put(val, key);
        return tx.complete;
    }).then(() => {
        // console.log('Added', key);
        // console.log('to', val);
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

const getPendingRequests = (callback) => {
    dbPromise.then(db => {
        return db.transaction('keyval').objectStore('keyval').get('pending_request');
    }).then(obj => {
        if(obj)
            callback(obj);
    }).catch( e => {
        toastr.error(`Error getting the list of Pending Requests from DB ${e}`);
    });
};

const removeKey = (key) => {
    return dbPromise.then(db => {
        const tx = db.transaction('keyval', 'readwrite');
        tx.objectStore('keyval').delete(key);
        return tx.complete;
    });
};

module.exports = {
    dbPromise,
    insert,
    selectAll,
    removeKey,
    getPendingRequests
};