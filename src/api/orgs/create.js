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
    NAME_REGEX,
    DESCRIPTION_REGEX
} = require("./const/regex");


// Initialising mongo collections
let mongoOrgsCollection = null;

mongoMod.then(collections => {
    let {orgsCollection} = collections;

    mongoOrgsCollection = orgsCollection;
});

/**
 * Implementation of orgs:create api method
 *
 * @param {String} userId
 * @param {Object} req
 * @returns {Object}
 */
async function create(userId, req) {
    if (!checkParams(req)) {
        return INVALID_PARAMS_ERR;
    }

    let {name, description} = req;
    let {id} = await addOrg(userId, name, description);

    return {res: 0, org: {id, name, description, admin_id: userId, user_ids: []}};
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

    let {name, description} = req;

    return typeof name == "string"
        && typeof description == "string"

        && NAME_REGEX.test(name)
        && DESCRIPTION_REGEX.test(description);
}

/**
 * Adds organisation to the database
 *
 * @param {String} userId
 * @param {String} name
 * @param {String} description
 * @returns {Object}
 */
async function addOrg(userId, name, description) {
    let id = genOrgId();

    await mongoOrgsCollection.insertOne(
        {id, name, description, admin_id: userId, user_ids: []});

    return {id};
}

/**
 * Generates organisation id
 *
 * @returns {String}
 */
function genOrgId() {
    return uuid();
}

module.exports = create;