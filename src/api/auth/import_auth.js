"use strict";
// Require async modules
let mongoMod = require("./db/mongo");

// Require constants
let {
    INVALID_PARAMS_ERR,
    INVALID_ACCOUNT_ERR
} = require("./const/err");

let {
    ID_REGEX,
    TOKEN_REGEX
} = require("./const/regex");


// Initialising mongo collections
let mongoUsersCollection = null;

mongoMod.then(collections => {
    let {usersCollection} = collections;

    mongoUsersCollection = usersCollection;
});

/**
 * Implementation of auth:import_auth api method
 *
 * @param {Object} req
 * @returns {Object}
 */
async function importAuth(req) {
    if (!checkParams(req)) {
        return INVALID_PARAMS_ERR;
    }

    let {id, token} = req;
    let {email, nickname, oid, isAdmin} = await getUser(id, token);

    if (!email) {
        return INVALID_ACCOUNT_ERR;
    }

    return {res: 0, user: {id, token, email, nickname, oid, isAdmin}};
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

    let {id, token} = req;

    return typeof id == "string"
        && typeof token == "string"

        && ID_REGEX.test(id)
        && TOKEN_REGEX.test(token);
}

/**
 * Gets user from the database
 *
 * @param {String} id
 * @param {String} token
 * @returns {Object|Boolean}
 */
async function getUser(id, token) {
    let dbRes = await mongoUsersCollection.findOne({id, token},
        {email: 1, nickname: 1, oid: 1, isAdmin: 1});

    if (!dbRes) {
        return false;
    }

    return dbRes;
}

module.exports = importAuth;
