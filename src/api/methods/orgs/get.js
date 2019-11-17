"use strict";
let mongoMod = require("../../db/mongo");


// Initializing mongo collections
let mongoOrgsCollection = null;

mongoMod.then(collections => {
    let {orgsCollection} = collections;

    mongoOrgsCollection = orgsCollection;
});

/**
 * Implementation of orgs:get api method
 *
 * @param {String} oid
 * @returns {Object}
 */
async function get(oid) {
    let {id, name, description} = await getOrg(oid);

    return {res: 0, org: {id, name, description}};
}

/**
 * Gets organization from the database
 *
 * @param {String} oid
 * @returns {Object}
 */
async function getOrg(oid) {
    return await mongoOrgsCollection.findOne({id: oid},
        {projection: {id: 1, name: 1, description: 1}});
}

module.exports = get;