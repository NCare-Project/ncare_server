"use strict";
// Require modules
let MongoClient = require("mongodb").MongoClient;

// Require configs
let {
    MONGO_CONNECT_URL,
    MONGO_DB_NAME
} = require("./config/mongo");


// Returning client
module.exports = new Promise(resolve => {
    // noinspection JSIgnoredPromiseFromCall,JSCheckFunctionSignatures
    MongoClient.connect(MONGO_CONNECT_URL, { useUnifiedTopology: true }, (err, client) => {
        let db = client.db(MONGO_DB_NAME);

        resolve(db);
    });
});