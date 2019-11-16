"use strict";
// Require modules
let auth = require("./auth");


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
     *   nickname {String}
     *   status {Number}
     */
    ioSocket.on("auth:sign_up", async req => {
        let res = await auth.signUp(req);

        if (!res.res) {
            user = res.user
        }

        ioSocket.emit("auth:sign_up", res);
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
     *   nickname {String}
     *   status {Number}
     */
    ioSocket.on("auth:sign_in", async req => {
        let res = await auth.signIn(req);

        if (!res.res) {
            user = res.user;
        }

        ioSocket.emit("auth:sign_in", res);
    });
}

module.exports = handleRequests;
