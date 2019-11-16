"use strict";
// Require async modules
let mongoMod = require("./db/mongo");

// Require constants
let {
    INVALID_PARAMS_ERR,
    INVALID_ACCOUNT_ERR
} = require("./const/err");

let {
    EMAIL_REGEX,
    PASSWORD_REGEX
} = require("./const/regex");


// Initialising mongo collections
let mongoUsersCollection = null;

mongoMod.then(collections => {
    let {usersCollection} = collections;

    mongoUsersCollection = usersCollection;
});

/**
 * Implementation of auth:sign_in api method
 *
 * @param {Object} req
 * @returns {Object}
 */
async function signIn(req) {
    if (!checkParams(req)) {
        return INVALID_PARAMS_ERR;
    }

    let {email, password} = req;
    let {id, token, nickname} = await getUser(email, password);

    if (!id) {
        return INVALID_ACCOUNT_ERR;
    }

    return {res: 0, user: {id, token, email, nickname}};
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

    let {email, password} = req;

    return typeof email == "string"
        && typeof password == "string"

        && EMAIL_REGEX.test(email)
        && PASSWORD_REGEX.test(password);
}

/**
 * Gets user from the database
 *
 * @param {String} email
 * @param {String} password
 * @returns {Object|Boolean}
 */
async function getUser(email, password) {
    let dbRes = await mongoUsersCollection.findOne({email, password},
        {id: 1, token: 1, nickname: 1});

    if (!dbRes) {
        return false;
    }

    return dbRes;
}

module.exports = signIn;