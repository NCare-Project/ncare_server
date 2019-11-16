"use strict";
// Require modules
let auth = require("./auth");
let events = require("./events");
let orgs = require("./orgs");

// Require constants
let {
    UNAUTHORIZED_ERR
} = require("./const/err");

/**
 * Handles api requests
 *
 * @param ioSocket
 */
function handleRequests(ioSocket) {
    let user = null;

    /**
     * Handles auth:sign_up method
     *
     * Params:
     *  email {String}
     *  password {String}
     *  nickname {String}
     *
     * Result:
     *  user:
     *   id {String}
     *   token {String}
     *   email {String}
     *   nickname {String}
     *   status {Number}
     */
    ioSocket.on("auth:sign_up", async req => {
        console.log("Req auth:sign_up:", req);

        let res = await auth.signUp(req);

        if (res.res === 0) {
            user = res.user
        }

        ioSocket.emit("auth:sign_up", res);
        console.log("Res auth:sign_up:", res);
    });

    /**
     * Handles auth:sign_in method
     *
     * Params:
     *  email {String}
     *  password {String}
     *
     * Result:
     *  user:
     *   id {String}
     *   token {String}
     *   email {String}
     *   nickname {String}
     *   status {Number}
     */
    ioSocket.on("auth:sign_in", async req => {
        console.log("Req auth:sign_in:", req);
        let res = await auth.signIn(req);

        if (res.res === 0) {
            user = res.user;
        }

        ioSocket.emit("auth:sign_in", res);
        console.log("Res auth:sign_in:", res);
    });

    /**
     * Handles auth:import_auth method
     *
     * Params:
     *  id {String}
     *  token {String}
     *
     * Result:
     *  user:
     *   id {String}
     *   token {String}
     *   email {String}
     *   nickname {String}
     *   status {Number}
     */
    ioSocket.on("auth:import_auth", async req => {
        console.log("Req auth:import_auth:", req);
        let res = await auth.importAuth(req);

        if (res.res === 0) {
            user = res.user;
        }

        ioSocket.emit("auth:import_auth", res);
        console.log("Res auth:import_auth:", res);
    });

    /**
     * Handles orgs:create method
     *
     * Params:
     *  name {String}
     *  description {String}
     *
     * Result:
     *  org:
     *   id {String}
     *   name {String}
     *   description {String}
     *   admin_id {String}
     *   user_ids: {Array<String>}
     *   zones: ...
     */
    ioSocket.on("orgs:create", async req => {
        console.log("Req orgs:create:", req);
        let res = null;

        if (user) {
            res = await orgs.create(user.id, req);
        } else {
            res = UNAUTHORIZED_ERR;
        }

        ioSocket.emit("orgs:create", res);
        console.log("Res orgs:create:", res);
    });

    /**
     * Handles events:create method
     *
     * Params:
     *  title {String}
     *  description {String}
     *  type {Number}
     *  coordinates {Array<Number>}
     *
     * Result:
     *  None
     */
    ioSocket.on("events:create", async req => {
        console.log("Req events:create:", req);
        let res = null;

        if (user) {
            res = await events.create(user.id, req);
        } else {
            res = UNAUTHORIZED_ERR;
        }

        ioSocket.emit("events:create", res);
        console.log("Res events:create:", res);
    });

}

module.exports = handleRequests;
