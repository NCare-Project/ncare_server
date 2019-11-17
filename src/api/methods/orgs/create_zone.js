"use strict";
let uuid = require("uuid/v4");
let err = require("../../const/err");
let regex = require("../../const/regex");
let mongoMod = require("../../db/mongo");


// Initializing mongo collections
let mongoZonesCollection = null;

mongoMod.then(collections => {
    let {zonesCollection} = collections;

    mongoZonesCollection = zonesCollection;
});

/**
 * Implementation of orgs:create_zone api method
 *
 * @param {String} oid
 * @param {Object} req
 * @returns {Object}
 */
async function createZone(oid, req) {
    if (!checkParams(req)) {
        return err.INVALID_PARAMS_ERR;
    }

    let {name, radius, coordinates} = req;
    let {id} = await addZone(oid, name, radius, coordinates);

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
        && regex.NAME_REGEX.test(name)

        && checkRadius(radius)
        && checkCoordinates(coordinates);
}

/**
 * Checks radius param for correctness
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
 * Checks coordinates param for correctness
 *
 * @param {Array<Number>} coordinates
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
 * @param {String} oid
 * @param {String} name
 * @param {Number} radius
 * @param {Array<Number>} coordinates
 * @returns {Object}
 */
async function addZone(oid, name, radius, coordinates) {
    let id = uuid();

    await mongoZonesCollection.insertOne(
        {id, name, radius, location: {type: "Point", coordinates}, oid});

    return {id};
}
module.exports = createZone;