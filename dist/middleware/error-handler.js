"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof errors_1.CustomAPIError) {
        return res
            .status(err.statusCode)
            .json({ success: false, msg: err.message });
    }
    if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
        const fields = err.keyValue
            ? Object.keys(err.keyValue).join(', ')
            : 'field';
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            msg: `Duplicate value for ${fields}`,
        });
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            success: false,
            msg: `No item found with id : ${err.value}`,
        });
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            msg: `${Object.values(err.errors)
                .map((item) => item.message)
                .join(', ')}`,
        });
    }
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        msg: 'Internal Server Error',
    });
};
exports.default = errorHandler;
