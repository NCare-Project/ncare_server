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
    TITLE_REGEX,
    DESCRIPTION_REGEX
} = require("./const/regex");


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
 * Implementation of events:create api method
 *
 * @param {String} userId
 * @param {Object} req
 * @returns {Object}
 */
async function create(userId, req) {
    if (!checkParams(req)) {
        return INVALID_PARAMS_ERR;
    }

    let {title, description, type, coordinates} = req;

    await addEvent(userId, title, description, type, coordinates);
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

    let {title, description, type, coordinates} = req;

    return typeof title == "string"
        && typeof description == "string"

        && TITLE_REGEX.test(title)
        && DESCRIPTION_REGEX.test(description)

        && checkType(type)
        && checkCoordinates(coordinates);
}

/**
 * Checks type field for correctness
 *
 * @param {Number} type
 * @returns {Boolean}
 */
function checkType(type) {
    return typeof type == "number"

        && type > 0
        && type < 10;
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
 * Adds organisation to the database
 *
 * @param {String} userId
 * @param {String} title
 * @param {String} description
 * @param {Number} type
 * @param {Array} coordinates
 * @returns {Object}
 */
async function addEvent(userId, title, description, type, coordinates) {
    let id = genEventId();

    let dbRes = await mongoZonesCollection.aggregate([
        {
            $geoNear: {
                near: {type: "Point", coordinates},
                distanceField: "distance",
            },
        }, {
            $project: {
                cmp: {
                    $cmp: ["radius", "distance"]
                },
                org_id: 1
            }
        }, {
            $match: {
                cmp: 1
            }
        }, {
            $project: {
                org_id: 1
            }
        }
    ]).next();

    console.log(dbRes);

    return true;
}

/**
 * Generates event id
 *
 * @returns {String}
 */
function genEventId() {
    return uuid();
}

module.exports = create;