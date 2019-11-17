"use strict";
let crypto = require("crypto");
let uuid = require("uuid");
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
 * Implementation of auth:sign_up api method
 *
 * @param {Object} req
 * @returns {Object}
 */
async function signUp(req) {
    if (!checkParams(req)) {
        return err.INVALID_PARAMS_ERR;
    }

    let {email, password, nickname} = req;
    let {id, token} = await addUser(email, password, nickname);

    if (!id) {
        return err.ACCOUNT_EXISTS_ERR;
    }

    // noinspection JSUnresolvedFunction
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

        && regex.EMAIL_REGEX.test(email)
        && regex.PASSWORD_REGEX.test(password)
        && regex.NICKNAME_REGEX.test(nickname);
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
    let id = uuid(),
        token = crypto.randomBytes(16).toString("hex");

    try {
        await mongoUsersCollection.insertOne(
            {id, token, email, password, nickname});

        return {id, token};
    } catch (e) {
        return false;
    }
}

module.exports = signUp;