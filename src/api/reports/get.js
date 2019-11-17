"use strict";
// Require modules
let uuid = require("uuid/v4");

// Require async modules
let mongoMod = require("./db/mongo");

// Require constants
let {
    NO_REPORTS_FOUND_ERR
} = require("./const/err");


// Initialising mongo collections
let mongoEventsCollection = null,

    mongoOrgsCollection = null,
    mongoZonesCollection = null;

mongoMod.then(collections => {
    let {eventsCollection, orgsCollection, zonesCollection} = collections;

    mongoEventsCollection = eventsCollection;

    mongoOrgsCollection = orgsCollection;
    mongoZonesCollection = zonesCollection;
});

/**
 * Implementation of reports:get api method
 *
 * @param {String} orgId
 * @returns {Object}
 */
async function get(orgId) {
    let {reports} = await getReports(orgId);

    if (!reports) {
        return NO_REPORTS_FOUND_ERR;
    }

    return {res: 0, reports};
}

/**
 * Gets reports from the database
 *
 * @param {String} orgId
 * @returns {Object|Boolean}
 */
async function getReports(orgId) {
    let dbRes = await mongoEventsCollection.find({oid: orgId}).toArray();

    if (!dbRes.length) {
        return false;
    }

    return {reports: dbRes};
}

module.exports = get;