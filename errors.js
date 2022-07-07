'use strict'

module.exports = {
    INVALID_DATA: {code: 400},
    NO_USER: {code: 401},
    INVALID_USER: {code: 403},
    MISSING_DATA: {code: 404},
    INTERNAL_ERROR: (e) => {return {code: 500, e: e}}
}