"use strict";
let uuid = require("uuid/v4");
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
 * Implementation of auth:sign_in api method
 *
 * @param {Object} req
 * @returns {Object}
 */
async function signIn(req) {
    if (!checkParams(req)) {
        return err.INVALID_PARAMS_ERR;
    }

    let {email, password} = req;
    let {id, token, nickname, oid, isAdmin} = await getUser(email, password);

    if (!id) {
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

    let {email, password} = req;

    return typeof email == "string"
        && typeof password == "string"

        && regex.EMAIL_REGEX.test(email)
        && regex.PASSWORD_REGEX.test(password);
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
        {projection: {id: 1, token: 1, nickname: 1, oid: 1, isAdmin: 1}});

    if (!dbRes) {
        return false;
    }

    return dbRes;
}

module.exports = signIn;