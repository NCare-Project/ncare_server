"use strict";
const ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_REGEX = /^[0-9a-f]{32}$/;
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^[0-9A-z!@#%&*()-_]{6,20}$/;
const NICKNAME_REGEX = /^[0-9A-z.-_]{3,20}$/;

module.exports = {
    ID_REGEX,
    TOKEN_REGEX,
    EMAIL_REGEX,
    PASSWORD_REGEX,
    NICKNAME_REGEX
};