"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_service_1 = __importDefault(require("../service/token-service"));
const errors_1 = require("../errors");
const requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authData = req.headers.authorization;
    if (!authData || !authData.startsWith('Bearer ')) {
        throw new errors_1.UnauthenticatedError('Please provide Authorization Data');
    }
    const accessToken = authData.split(' ')[1];
    if (!accessToken) {
        throw new errors_1.UnauthenticatedError('Please provide Authorization token');
    }
    try {
        const userData = token_service_1.default.validateAccessToken(accessToken);
        if (!userData) {
            throw new errors_1.UnauthenticatedError('Invalid authentication token');
        }
        req.user = userData;
        next();
    }
    catch (error) {
        console.error(error);
        throw new errors_1.UnauthenticatedError('Authentication failed');
    }
});
exports.default = requireAuth;
