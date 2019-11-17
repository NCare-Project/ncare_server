"use strict";
let err = require("../../const/err");
let regex = require("../../const/regex");
let mongoMod = require("../../db/mongo");


// Initializing mongo collections
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
        return err.INVALID_PARAMS_ERR;
    }

    let {id, token} = req;
    let {email, nickname, oid, isAdmin} = await getUser(id, token);

    if (!email) {
        return err.ACCOUNT_DOESNT_EXIST_ERR;
    }

    // noinspection JSUnresolvedFunction
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

        && regex.ID_REGEX.test(id)
        && regex.TOKEN_REGEX.test(token);
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
        {projection: {email: 1, nickname: 1, oid: 1, isAdmin: 1}});

    if (!dbRes) {
        return false;
    }

    return dbRes;
}

module.exports = importAuth;
