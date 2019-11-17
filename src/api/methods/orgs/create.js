"use strict";
let uuid = require("uuid/v4");
let err = require("../../const/err");
let regex = require("../../const/regex");
let mongoMod = require("../../db/mongo");


// Initializing mongo collections
let mongoUsersCollection = null,
    mongoOrgsCollection = null;

mongoMod.then(collections => {
    let {usersCollection, orgsCollection} = collections;

    mongoUsersCollection = usersCollection;
    mongoOrgsCollection = orgsCollection;
});

/**
 * Implementation of orgs:create api method
 *
 * @param {String} uid
 * @param {Object} req
 * @returns {Object}
 */
async function create(uid, req) {
    if (!checkParams(req)) {
        return err.INVALID_PARAMS_ERR;
    }

    let {name, description} = req;
    let {id} = await addOrg(uid, name, description);

    // noinspection JSUnresolvedFunction
    return {res: 0, org: {id, name, description}};
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

        && regex.NAME_REGEX.test(name)
        && regex.DESCRIPTION_REGEX.test(description);
}

/**
 * Adds organization to the database
 *
 * @param {String} uid
 * @param {String} name
 * @param {String} description
 * @returns {Object}
 */
async function addOrg(uid, name, description) {
    let id = uuid();

    let updateUser = mongoUsersCollection.updateOne({id: uid},
        {$set: {oid: id, isAdmin: true}});

    let insertOrg = mongoOrgsCollection.insertOne(
        {id, name, description});

    await Promise.all([updateUser, insertOrg]);

    return {id};
}

module.exports = create;