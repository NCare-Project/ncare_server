"use strict";
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^[0-9A-z!@#%&*()-_]{6,20}$/;
const NICKNAME_REGEX = / /g; // TODO: Add nickname regex

module.exports = {
    EMAIL_REGEX,
    PASSWORD_REGEX,
    NICKNAME_REGEX
};