"use strict";
const UNAUTHORIZED_ERR = {res: 1};
const INVALID_PARAMS_ERR = {res: 2};
const ACCOUNT_DOESNT_EXIST_ERR = {res: 10};
const ACCOUNT_EXISTS_ERR = {res: 11};
const NOT_IN_ORG_ERR = {res: 30};
const ALREADY_IN_ORG_ERR = {res: 31};
const NO_PERMISSION_FOR_ORG_ERR = {res: 32};
const NO_ZONES_ERR = {res: 33};
const NO_REPORTS_ERR = {res: 40};

module.exports = {
    UNAUTHORIZED_ERR,
    INVALID_PARAMS_ERR,

    ACCOUNT_DOESNT_EXIST_ERR,
    ACCOUNT_EXISTS_ERR,

    NOT_IN_ORG_ERR,
    ALREADY_IN_ORG_ERR,
    NO_PERMISSION_FOR_ORG_ERR,

    NO_ZONES_ERR,

    NO_REPORTS_ERR
};