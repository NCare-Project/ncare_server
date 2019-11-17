"use strict";
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
 * Implementation of orgs:zones api method
 *
 * @param {String} oid
 * @returns {Object}
 */
async function zones(oid) {
    let {zones} = await getZones(oid);

    if (!zones) {
        return err.NO_ZONES_ERR;
    }

    return {res: 0, zones};
}

/**
 * Gets organization zones from the database
 *
 * @param {String} oid
 * @returns {Object|Boolean}
 */
async function getZones(oid) {
    let dbRes = await mongoZonesCollection.aggregate([
        {
            $match: {
                oid
            }
        }, {
            $project: {
                _id: 0,
                id: 1,
                name: 1,
                radius: 1,
                coordinates: "$location.coordinates"
            }
        }
    ]).toArray();

    if (!dbRes.length) {
        return false;
    }

    return {zones: dbRes};
}

module.exports = zones;