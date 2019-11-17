"use strict";
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
 * Implementation of orgs:add_user api method
 *
 * @param {String} oid
 * @param {String} req
 * @returns {Object}
 */
async function addUser(oid, req) {
    if (!checkParams(req)) {
        return err.INVALID_PARAMS_ERR;
    }

    let {uid} = req;
    let dbRes = addUserToOrg(oid, req);

    if (!dbRes) {
        return err.ALREADY_IN_ORG_ERR;
    }

    return {res: 0};
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

    let {uid} = req;

    return typeof uid == "string"
        && regex.ID_REGEX.test(uid);
}

/**
 * Adds user to organization
 *
 * @param {String} oid
 * @param {String} uid
 * @returns {Boolean}
 */
async function addUserToOrg(oid, uid) {
    let dbRes = await mongoUsersCollection.findOneAndUpdate({id: uid, oid: null}, {$set: {oid: oid, isAdmin: false}});

    return !!dbRes;
}

module.exports = addUser;