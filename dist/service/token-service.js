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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Token_1 = __importDefault(require("../model/Token"));
class TokenService {
    generateTokens(userId, name) {
        const accessSecret = process.env.JWT_ACCESS_SECRET;
        const accessExpiresIn = process.env
            .JWT_ACCESS_LIFETIME;
        const accessToken = jsonwebtoken_1.default.sign({ userId, name }, accessSecret, {
            expiresIn: accessExpiresIn,
        });
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        const refreshExpiresIn = process.env
            .JWT_REFRESH_LIFETIME;
        const refreshToken = jsonwebtoken_1.default.sign({ userId, name }, refreshSecret, {
            expiresIn: refreshExpiresIn,
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    saveToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = yield Token_1.default.findOne({ user: userId });
            if (tokenData) {
                tokenData.refreshToken = refreshToken;
                return tokenData.save();
            }
            const token = yield Token_1.default.create({ user: userId, refreshToken });
            return token;
        });
    }
    removeToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = yield Token_1.default.deleteOne({ refreshToken });
            return tokenData;
        });
    }
    findToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = yield Token_1.default.findOne({ refreshToken });
            return tokenData;
        });
    }
    validateAccessToken(token) {
        try {
            const userData = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET || '');
            return userData;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
    validateRefreshToken(token) {
        try {
            const userData = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || '');
            return userData;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
    generateResetToken(userId, jti) {
        const resetSecret = process.env.JWT_REFRESH_SECRET;
        const resetExpiresIn = process.env
            .JWT_REFRESH_LIFETIME;
        const resetToken = jsonwebtoken_1.default.sign({ userId, jti }, resetSecret, {
            expiresIn: resetExpiresIn,
        });
        return resetToken;
    }
    validateResetToken(token) {
        try {
            const userData = jsonwebtoken_1.default.verify(token, process.env.JWT_RESET_SECRET || '');
            return userData;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
}
exports.default = new TokenService();
