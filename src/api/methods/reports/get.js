"use strict";
let err = require("../../const/err");
let mongoMod = require("../../db/mongo");


// Initialising mongo collections
let mongoReportsCollection = null;

mongoMod.then(collections => {
    let {reportsCollection} = collections;

    mongoReportsCollection = reportsCollection;
});

/**
 * Implementation of reports:get api method
 *
 * @param {String} uid
 * @param {String} oid
 * @returns {Object}
 */
async function get(uid, oid) {
    let {reports} = await getReports(uid, oid);

    if (!reports) {
        return err.NO_REPORTS_ERR;
    }

    return {res: 0, reports};
}

/**
 * Gets reports from the database
 *
 * @param {String} uid
 * @param {String} oid
 * @returns {Object|Boolean}
 */
async function getReports(uid, oid) {
    let dbRes = await mongoReportsCollection.aggregate([
        {
            $match: {
                $or: [{uid}, {oid}]
            }
        }, {
            $project: {
                _id: 0,
                id: 1,
                name: 1,
                description: 1,
                type: 1,
                coordinates: "$location.coordinates",
                uid: 1,
                oid: 1,
                zid: 1
            }
        }
    ]).toArray();

    if (!dbRes.length) {
        return false;
    }

    return {reports: dbRes};
}

module.exports = get;