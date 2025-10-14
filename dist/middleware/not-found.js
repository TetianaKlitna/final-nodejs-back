"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const notFound = (req, res) => {
    return res
        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
        .json({ success: false, msg: http_status_codes_1.ReasonPhrases.NOT_FOUND });
};
exports.default = notFound;
