"use strict";
// Require modules
let uuid = require("uuid/v4");

// Require async modules
let mongoMod = require("./db/mongo");

// Require constants
let {
    INVALID_PARAMS_ERR
} = require("./const/err");

let {
    NAME_REGEX
} = require("./const/regex");


// Initialising mongo collections
let mongoZoneCollection = null;

mongoMod.then(collections => {
    let {zoneCollection} = collections;

    mongoZoneCollection = zoneCollection;
});

/**
 * Implementation of orgs:create_zone api method
 *
 * @param {String} orgId
 * @param {Object} req
 * @returns {Object}
 */
async function createZone(orgId, req) {
    if (!checkParams(req)) {
        return INVALID_PARAMS_ERR;
    }

    let {name, radius, coordinates} = req;
    let {id} = await addZone(orgId, name, radius, coordinates);

    return {res: 0, zone: {id, name, radius, coordinates}};
}

/**
 * Checks the method params for correctness
 *
 * @param {Object} req
 * @returns {Boolean}
 */
function checkParams(req) {
    if (typeof req != "object") {
        return false;
    }

    let {name, radius, coordinates} = req;

    return typeof name == "string"
        && NAME_REGEX.test(name)

        && checkRadius(radius)
        && checkCoordinates(coordinates);
}

/**
 * Checks radius field for correctness
 *
 * @param {Number} radius
 * @returns {Boolean}
 */
function checkRadius(radius) {
    return typeof radius == "number"

        && radius > 50
        && radius < 50000;
}

/**
 * Checks coordinates field for correctness
 *
 * @param {Array} coordinates
 * @returns {Boolean}
 */
function checkCoordinates(coordinates) {
    // noinspection JSIncompatibleTypesComparison
    return coordinates.constructor === Array

        && coordinates.length === 2
        && typeof coordinates[0] == "number"
        && typeof coordinates[1] == "number"
}

/**
 * Adds zone to the database
 *
 * @param {String} orgId
 * @param {String} name
 * @param {Number} radius
 * @param {Array<Number>} coordinates
 * @returns {Object}
 */
async function addZone(orgId, name, radius, coordinates) {
    let id = genZoneId();

    await mongoZoneCollection.insertOne(
        {id, name, radius, location: {type: "Point", coordinates}, oid: orgId});

    return {id};
}

/**
 * Generates zone id
 *
 * @returns {String}
 */
function genZoneId() {
    return uuid();
}

module.exports = createZone;