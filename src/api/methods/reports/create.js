"use strict";
let uuid = require("uuid/v4");
let err = require("../../const/err");
let regex = require("../../const/regex");
let mongoMod = require("../../db/mongo");


// Initialising mongo collections
let mongoZonesCollection = null,
    mongoReportsCollection = null;

mongoMod.then(collections => {
    let {zonesCollection, reportsCollection} = collections;

    mongoZonesCollection = zonesCollection;
    mongoReportsCollection = reportsCollection;
});

/**
 * Implementation of reports:create api method
 *
 * @param {String} uid
 * @param {Object} req
 * @returns {Object}
 */
async function create(uid, req) {
    if (!checkParams(req)) {
        return err.INVALID_PARAMS_ERR;
    }

    let {name, description, type, coordinates} = req;
    let {id, oid, zid} = await addReport(uid, name, description, type, coordinates);

    if (!id) {
        return err.NOT_IN_ORG_ERR;
    }

    return {res: 0, report: {id, name, description, type, coordinates, uid, oid, zid}};
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

    let {name, description, type, coordinates} = req;

    return typeof name == "string"
        && typeof description == "string"

        && regex.NAME_REGEX.test(name)
        && regex.DESCRIPTION_REGEX.test(description)

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
 * @param {String} uid
 * @param {String} name
 * @param {String} description
 * @param {Number} type
 * @param {Array} coordinates
 * @returns {Object|Boolean}
 */
async function addReport(uid, name, description, type, coordinates) {
    let id = uuid();

    let dbRes = await mongoZonesCollection.aggregate([
        {
            $geoNear: {
                near: {type: "Point", coordinates},
                distanceField: "distance",
            },
        }, {
            $project: {
                cmp: {
                    $cmp: ["$radius", "$distance"]
                },
                id: 1,
                oid: 1
            }
        }, {
            $match: {
                cmp: 1
            }
        }, {
            $project: {
                id: 1,
                oid: 1
            }
        }
    ]).next();

    if (!dbRes) {
        return false;
    }

    await mongoReportsCollection.insertOne(
        {id, name, description, type, location: {type: "Point", coordinates}, uid, oid: dbRes.oid, zid: dbRes.id});

    return {id, oid: dbRes.oid, zid: dbRes.id};
}

module.exports = create;