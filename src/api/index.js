"use strict";
// Require modules
let EventEmitter = require("events");
let auth = require("./auth");
let orgs = require("./orgs");
let reports = require("./reports");

// Require constants
let {
    UNAUTHORIZED_ERR,
    NO_ORG_ERR,
    ALREADY_IN_ORG_ERR,
    NO_PERMISSION_FOR_ORG_ERR
} = require("./const/err");


let events = new EventEmitter;

/**
 * Handles api requests
 *
 * @param ioSocket
 */
function handleRequests(ioSocket) {
    let user = null;

    let userHandler = (type, data) => {
        // Do stuff
    };

    let orgHandler = (type, eid, data) => {
        console.log("Got notification on user", user.nickname);
        if (eid === user.id) {
            return;
        }

        switch (type) {
            case "orgs:new_zone":
                ioSocket.emit("updates:orgs:new_zone", {zone: data.zone});
                break;

            case "orgs:new_user":
                break;

            case "reports:new":
                console.log("Got org handler (reports:new) for user", user.nickname);
                ioSocket.emit("updates:reports:new", {report: data.report});
                break;
        }
    };

    function setEventHandlers() {
        events.on(`user:${user.id}`, userHandler);

        if (user.oid) {
            events.on(`org:${user.oid}`, orgHandler);
        }
    }

    /**
     * Handles auth:sign_up method
     */
    ioSocket.on("auth:sign_up", async req => {
        console.log("Req auth:sign_up:", req);

        let res = await auth.signUp(req);

        if (res.res === 0) {
            user = res.user;

            setEventHandlers(res.user);
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
            user = res.user;

            setEventHandlers(res.user);
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
            user = res.user;

            setEventHandlers(res.user);
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
            res = UNAUTHORIZED_ERR;
        } else if (user.oid) {
            res = ALREADY_IN_ORG_ERR;
        } else {
            res = await orgs.create(user.id, req);
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
            res = UNAUTHORIZED_ERR;
        } else if (!user.oid) {
            res = NO_ORG_ERR;
        } else if (!user.isAdmin) {
            res = NO_PERMISSION_FOR_ORG_ERR
        } else {
            res = await orgs.createZone(user.oid, req);
        }

        if (res.res === 0) {
            events.emit(`org:${user.oid}`, "orgs:new_zone", user.id, res);

        }

        ioSocket.emit("orgs:create_zone", res);
        console.log("Res orgs:create_zone:", res);
    });

    /**
     * Handles orgs:get_zones method
     */
    ioSocket.on("orgs:get_zones", async req => {
        console.log("Req orgs:get_zones:", req);
        let res = null;

        if (!user) {
            res = UNAUTHORIZED_ERR;
        } else if (!user.oid) {
            res = NO_ORG_ERR;
        } else {
            res = await orgs.getZones(user.oid);
        }

        ioSocket.emit("orgs:get_zones", res);
        console.log("Res orgs:get_zones:", res);
    });

    /**
     * Handles orgs:get method
     */
    ioSocket.on("orgs:get", async req => {
        console.log("Req orgs:get:", req);
        let res = null;

        if (!user) {
            res = UNAUTHORIZED_ERR;
        } else if (!user.oid) {
            res = NO_ORG_ERR;
        } else {
            res = await orgs.get(user.oid);
        }

        ioSocket.emit("orgs:get", res);
        console.log("Res orgs:get:", res);
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
            res = UNAUTHORIZED_ERR;
        }

        if (res.res === 0) {
            events.emit(`org:${res.report.oid}`, "reports:new", user.id, res);
        }

        ioSocket.emit("reports:create", res);
        console.log("Res reports:create:", res);
    });

    /**
     * Handles reports:get method
     */
    ioSocket.on("reports:get", async req => {
        console.log("Req reports:get:", req);
        let res = null;

        if (!user) {
            res = UNAUTHORIZED_ERR;
        } else if (!user.oid) {
            res = NO_ORG_ERR;
        } else {
            res = await reports.get(user.oid);
        }

        ioSocket.emit("reports:get", res);
        console.log("Res reports:get:", res);
    });

    ioSocket.on("disconnect", () => {
        console.log("Disconnection");
        if (user) {
            events.off(`user:${user.id}`, userHandler);

            if (user.oid) {
                events.off(`org:${user.oid}`, orgHandler);
            }
        }
    });

}

module.exports = handleRequests;
