"use strict";
// Require modules
let uuid = require("uuid/v4");

// Require async modules
let mongoMod = require("./db/mongo");

// Require constants
let {
    INVALID_PARAMS_ERR,
    NO_ORGS_FROUND_ERR
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
 * Implementation of reports:create api method
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
    let {id, oid, zid} = await addReport(userId, title, description, type, coordinates);

    if (!id) {
        return NO_ORGS_FROUND_ERR;
    }

    return {res: 0, report: {id, title, description, type, coordinates, oid, zid}};
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

        && type >= 0
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
 * Adds report to the database
 *
 * @param {String} userId
 * @param {String} title
 * @param {String} description
 * @param {Number} type
 * @param {Array} coordinates
 * @returns {Object|Boolean}
 */
async function addReport(userId, title, description, type, coordinates) {
    let id = genReportId();

    let dbRes = await mongoZonesCollection.aggregate([
        {
            $geoNear: {
                near: {type: "Point", coordinates: [122, 66]},
                distanceField: "distance",
            },
        }, {
            $project: {
                cmp: {
                    $cmp: ["$radius", "$distance"]
                },
                oid: 1,
                zid: 1
            }
        }, {
            $match: {
                cmp: 1
            }
        }, {
            $project: {
                oid: 1,
                zid: 1
            }
        }
    ]).next();

    if (!dbRes) {
        return false;
    }

    await mongoEventsCollection.insertOne(
        {id, title, description, type, coordinates, oid: dbRes.oid, zid: dbRes.zid});

    return {id, oid: dbRes.oid, zid: dbRes.zid};
}

/**
 * Generates report id
 *
 * @returns {String}
 */
function genReportId() {
    return uuid();
}

module.exports = create;