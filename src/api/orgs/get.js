"use strict";
// Require async modules
let mongoMod = require("./db/mongo");

// Require constants
let {
    NO_ZONES_FOUND_ERR
} = require("./const/err");


// Initialising mongo collections
let mongoOrgsCollection = null;

mongoMod.then(collections => {
    let {orgsCollection} = collections;

    mongoOrgsCollection = orgsCollection;
});

/**
 * Implementation of orgs:getZones api method
 *
 * @param {String} orgId
 * @returns {Object}
 */
async function get(orgId) {
    let {org} = await getOrg(orgId);

    return {res: 0, org};
}

/**
 * Gets organisation from the database
 *
 * @param {String} orgId
 * @returns {Object|Boolean}
 */
async function getOrg(orgId) {
    let dbRes = await mongoOrgsCollection.find({id: orgId}).next();

    return {org: dbRes};
}

module.exports = get;