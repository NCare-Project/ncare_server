"use strict";
let EventEmitter = require("events");
let err = require("./const/err");
let auth = require("./methods/auth");
let orgs = require("./methods/orgs");
let reports = require("./methods/reports");


let emitter = new EventEmitter;

/**
 * Handles api requests
 *
 * @param ioSocket
 */
function handleRequests(ioSocket) {
    let user = null;

    let userHandler = (event, data) => {
        user.oid = data.oid;
        user.isAdmin = false;

        ioSocket.emit(event, data);
    };

    let orgHandler = (eid, event, data) => {
        if (!user || user.id === eid) {
            return;
        }

        delete data.res;
        ioSocket.emit(event, data);
    };

    /**
     * Sets user from response
     *
     * @param {Object} res
     */
    function setUser(res) {
        removeUser();

        user = res.user;
        emitter.on(`user:${user.id}`, userHandler);

        if (user.oid) {
            emitter.on(`org:${user.oid}`, orgHandler);
        }
    }

    /**
     * Removes user
     */
    function removeUser() {
        if (user) {
            emitter.off(`user:${user.id}`, userHandler);

            if (user.oid) {
                emitter.off(`org${user.oid}`, orgHandler);
            }

            user = null;
        }
    }

    /**
     * Handles auth:sign_up method
     */
    ioSocket.on("auth:sign_up", async req => {
        console.log("Req auth:sign_up:", req);

        let res = await auth.signUp(req);

        if (res.res === 0) {
            setUser(res);
        }

        ioSocket.emit("auth:sign_up", res);
        console.log("Res auth:sign_up:", res);
    });

    /**
     * Handles auth:sign_in method
     */
    ioSocket.on("auth:sign_in", async req => {
        console.log("Req auth:sign_in:", req);
        let res = await auth.signIn(req);

        if (res.res === 0) {
            setUser(res);
        }

        ioSocket.emit("auth:sign_in", res);
        console.log("Res auth:sign_in:", res);
    });

    /**
     * Handles auth:import_auth method
     */
    ioSocket.on("auth:import_auth", async req => {
        console.log("Req auth:import_auth:", req);
        let res = await auth.importAuth(req);

        if (res.res === 0) {
            setUser(res);
        }

        ioSocket.emit("auth:import_auth", res);
        console.log("Res auth:import_auth:", res);
    });


    /**
     * Handles orgs:create method
     */
    ioSocket.on("orgs:create", async req => {
        console.log("Req orgs:create:", req);
        let res = null;

        if (!user) {
            res = err.UNAUTHORIZED_ERR;
        } else if (user.oid) {
            res = err.ALREADY_IN_ORG_ERR;
        } else {
            res = await orgs.create(user.id, req);
        }

        if (res.res === 0) {
            user.oid = res.org.id;
            user.isAdmin = true;
        }


        ioSocket.emit("orgs:create", res);
        console.log("Res orgs:create:", res);
    });

    /**
     * Handles orgs:create_zone method
     */
    ioSocket.on("orgs:create_zone", async req => {
        console.log("Req orgs:create_zone:", req);
        let res = null;

        if (!user) {
            res = err.UNAUTHORIZED_ERR;
        } else if (!user.oid) {
            res = err.NOT_IN_ORG_ERR;
        } else if (!user.isAdmin) {
            res = err.NO_PERMISSION_FOR_ORG_ERR
        } else {
            res = await orgs.createZone(user.oid, req);
        }


        ioSocket.emit("orgs:create_zone", res);
        console.log("Res orgs:create_zone:", res);

        if (res.res === 0) {
            emitter.emit(`org:${user.oid}`, user.id,"updates:orgs:new_zone", res);
        }
    });

    /**
     * Handles orgs:get_zones method
     */
    ioSocket.on("orgs:zones", async req => {
        console.log("Req orgs:zones:", req);
        let res = null;

        if (!user) {
            res = err.UNAUTHORIZED_ERR;
        } else if (!user.oid) {
            res = err.NOT_IN_ORG_ERR;
        } else {
            res = await orgs.zones(user.oid);
        }

        ioSocket.emit("orgs:zones", res);
        console.log("Res orgs:zones:", res);
    });

    /**
     * Handles orgs:get method
     */
    ioSocket.on("orgs:get", async req => {
        console.log("Req orgs:get:", req);
        let res = null;

        if (!user) {
            res = err.UNAUTHORIZED_ERR;
        } else if (!user.oid) {
            res = err.NOT_IN_ORG_ERR;
        } else {
            res = await orgs.get(user.oid);
        }

        ioSocket.emit("orgs:get", res);
        console.log("Res orgs:get:", res);
    });

    /**
     * Handles orgs:add_user method
     */
    ioSocket.on("orgs:add_user", async req => {
        console.log("Req orgs:get:", req);
        let res = null;

        if (!user) {
            res = err.UNAUTHORIZED_ERR;
        } else if (!user.oid) {
            res = err.NOT_IN_ORG_ERR;
        } else if (!user.isAdmin) {
            res = err.NO_PERMISSION_FOR_ORG_ERR
        } else {
            res = await orgs.addUser(user.oid, req);
        }

        ioSocket.emit("orgs:get", res);
        console.log("Res orgs:get:", res);

        if (res.res) {
            emitter.emit(`user:${req.uid}`, "updates:orgs:new", {oid: user.oid});
        }
    });

    /**
     * Handles reports:create method
     */
    ioSocket.on("reports:create", async req => {
        console.log("Req reports:create:", req);
        let res = null;

        if (user) {
            res = await reports.create(user.id, req);
        } else {
            res = err.UNAUTHORIZED_ERR;
        }

        ioSocket.emit("reports:create", res);
        console.log("Res reports:create:", res);

        if (res.res === 0) {
            emitter.emit(`org:${res.report.oid}`, user.id, "updates:reports:new", res);
        }
    });

    /**
     * Handles reports:get method
     */
    ioSocket.on("reports:get", async req => {
        console.log("Req reports:get:", req);
        let res = null;

        if (!user) {
            res = err.UNAUTHORIZED_ERR;
        } else {
            res = await reports.get(user.id, user.oid);
        }

        ioSocket.emit("reports:get", res);
        console.log("Res reports:get:", res);
    });

    ioSocket.on("disconnect", () => {
        console.log("Disconnection");

        removeUser();
    });

}

module.exports = handleRequests;
