"use strict";
// Require modules
let crypto = require("crypto");
let uuid = require("uuid/v4");

// Require async modules
let mongoMod = require("./db/mongo");

// Require constants
let {
    INVALID_PARAMS_ERR,
    INVALID_ACCOUNT_ERR
} = require("./const/err");

let {
    EMAIL_REGEX,
    PASSWORD_REGEX,
    NICKNAME_REGEX
} = require("./const/regex");


// Initialising mongo collections
let mongoUsersCollection = null;

mongoMod.then(collections => {
    let {usersCollection} = collections;

    mongoUsersCollection = usersCollection;
});

/**
 * Implementation of auth:sign_up api method
 *
 * @param {Object} req
 * @returns {Object}
 */
async function signUp(req) {
    if (!checkParams(req)) {
        return INVALID_PARAMS_ERR;
    }

    let {email, password, nickname} = req;
    let {id, token} = await addUser(email, password, nickname);

    if (!id) {
        return INVALID_ACCOUNT_ERR
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

    let {email, password, nickname} = req;

    return typeof email == "string"
        && typeof password == "string"
        && typeof nickname == "string"

        && EMAIL_REGEX.test(email)
        && PASSWORD_REGEX.test(password)
        && NICKNAME_REGEX.test(nickname);
}

/**
 * Adds user to the database
 *
 * @param {String} email
 * @param {String} password
 * @param {String} nickname
 * @returns {Object|Boolean}
 */
async function addUser(email, password, nickname) {
    let id = genUserId(), token = getUserToken();

    try {
        await mongoUsersCollection.insertOne({id, token, email, password, nickname});

        return {id, token};
    } catch (e) {
        return false;
    }
}

/**
 * Generates user id
 *
 * @returns {String}
 */
function genUserId() {
    return uuid();
}

/**
 * Generates user token
 *
 * @returns {String}
 */
function getUserToken() {
    return crypto.randomBytes(16).toString("hex");
}

module.exports = signUp;