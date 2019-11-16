"use strict";
// Require modules
let IoServer = require("socket.io");
let handleRequests = require("./api");


// Creating socket.io server
let ioServer = new IoServer(null);

// noinspection JSUnresolvedFunction
/**
 * Handles connections
 */
ioServer.on("connection", ioSocket => {
    console.log("Connection");

    handleRequests(ioSocket);
});

ioServer.listen(5000);

