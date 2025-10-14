"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.NotFoundError = exports.UnauthenticatedError = exports.BadRequestError = exports.CustomAPIError = void 0;
const CustomAPIError_1 = __importDefault(require("./CustomAPIError"));
exports.CustomAPIError = CustomAPIError_1.default;
const BadRequestError_1 = __importDefault(require("./BadRequestError"));
exports.BadRequestError = BadRequestError_1.default;
const UnauthenticatedError_1 = __importDefault(require("./UnauthenticatedError"));
exports.UnauthenticatedError = UnauthenticatedError_1.default;
const NotFoundError_1 = __importDefault(require("./NotFoundError"));
exports.NotFoundError = NotFoundError_1.default;
const ForbiddenError_1 = __importDefault(require("./ForbiddenError"));
exports.ForbiddenError = ForbiddenError_1.default;
