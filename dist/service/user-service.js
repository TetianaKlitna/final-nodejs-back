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
const User_1 = __importDefault(require("../model/User"));
const uuid_1 = __importDefault(require("uuid"));
const mail_service_1 = __importDefault(require("./mail-service"));
const token_service_1 = __importDefault(require("./token-service"));
const errors_1 = require("../errors");
const user_dto_1 = __importDefault(require("../dto/user-dto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ms_1 = __importDefault(require("ms"));
class UserService {
    registration(name, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const candidate = yield User_1.default.findOne({ email });
            if (candidate) {
                throw new errors_1.BadRequestError('An account with this email already exists.');
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            const activationLink = uuid_1.default.v4();
            yield User_1.default.create({
                name,
                email,
                password: hashedPassword,
                activationLink
            });
            yield mail_service_1.default.sendActivationLink(email, `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`);
        });
    }
    activate(activationLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ activationLink });
            if (!user) {
                throw new errors_1.BadRequestError('Invalid or expired activation link');
            }
            user.isActivated = true;
            yield user.save();
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email });
            if (!user) {
                throw new errors_1.BadRequestError('User with this email was not found');
            }
            const isPassSame = yield bcryptjs_1.default.compare(password, user.password || '');
            if (!isPassSame) {
                throw new errors_1.BadRequestError('Incorrect password');
            }
            if (!user.isActivated) {
                throw new errors_1.ForbiddenError('Please verify your email before logging in');
            }
            const userdto = new user_dto_1.default(user);
            const tokens = token_service_1.default.generateTokens(userdto.userId, userdto.name);
            yield token_service_1.default.saveToken(userdto.userId, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: userdto });
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield token_service_1.default.removeToken(refreshToken);
            return token;
        });
    }
    refresh(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken) {
                throw new errors_1.UnauthenticatedError('Invalid or missing authentication token');
            }
            const userData = token_service_1.default.validateRefreshToken(refreshToken);
            const tokenFromDB = token_service_1.default.findToken(refreshToken);
            if (!userData || !tokenFromDB) {
                throw new errors_1.UnauthenticatedError('Invalid or missing authentication token');
            }
            const user = yield User_1.default.findById(userData.userId);
            if (!user) {
                throw new errors_1.UnauthenticatedError('Invalid token: user does not exist.');
            }
            const userdto = new user_dto_1.default(user);
            const tokens = token_service_1.default.generateTokens(userdto.userId, userdto.name);
            yield token_service_1.default.saveToken(userdto.userId, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: userdto });
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email });
            if (!user) {
                throw new errors_1.BadRequestError('No account found with this email address.');
            }
            if (!user.isActivated) {
                throw new errors_1.ForbiddenError('Please verify your email before logging in');
            }
            const jti = uuid_1.default.v4();
            const expiresIn = process.env.JWT_RESET_LIFETIME || '15m';
            user.resetPasswordJti = jti;
            user.resetPasswordExpires = new Date(Date.now() + (0, ms_1.default)(expiresIn));
            yield user.save();
            const userId = user._id.toString();
            const resetToken = token_service_1.default.generateResetToken(userId, jti);
            yield mail_service_1.default.sendResetPasswordLink(email, `${process.env.CLIENT_URL}/resetPassword?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`);
        });
    }
    resetPassword(email, token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = token_service_1.default.validateResetToken(token);
            if (!userData) {
                throw new errors_1.UnauthenticatedError('Invalid or missing reset token');
            }
            const user = yield User_1.default.findById(userData.userId);
            if (!user) {
                throw new errors_1.BadRequestError('This reset link is invalid or has expired.');
            }
            const normalizedEmail = email.trim().toLowerCase();
            if (user.email !== normalizedEmail) {
                throw new errors_1.BadRequestError('Email does not match.');
            }
            if (!user.isActivated) {
                throw new errors_1.ForbiddenError('Please verify your email before logging in.');
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
            const updated = yield User_1.default.findOneAndUpdate({
                _id: user._id,
                resetPasswordJti: userData.jti,
                resetPasswordExpires: { $gt: new Date() },
                isActivated: true
            }, {
                $set: {
                    password: hashedPassword
                },
                $unset: {
                    resetPasswordJti: '',
                    resetPasswordExpires: ''
                }
            }, { new: true });
            if (!updated) {
                throw new errors_1.ForbiddenError('This password reset link is no longer valid.');
            }
        });
    }
    getCurrentUser(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!accessToken) {
                throw new errors_1.UnauthenticatedError('Access token missing');
            }
            const payload = token_service_1.default.validateAccessToken(accessToken);
            if (!payload) {
                throw new errors_1.UnauthenticatedError('Invalid or expired token');
            }
            const user = yield User_1.default.findById(payload.userId).select('name email');
            if (!user) {
                throw new errors_1.UnauthenticatedError('User not found');
            }
            const userdto = new user_dto_1.default(user);
            return { accessToken, user: userdto };
        });
    }
    googleLogin(email, fullName, googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield User_1.default.findOne({ email });
            if (user && user.provider !== 'google') {
                throw new errors_1.BadRequestError('This email is already registered.');
            }
            if (user && user.googleId !== googleId) {
                user.googleId = googleId;
                yield user.save();
            }
            if (!user) {
                user = yield User_1.default.create({
                    email,
                    name: fullName,
                    googleId,
                    provider: 'google',
                    isActivated: true
                });
            }
            const userdto = new user_dto_1.default(user);
            const tokens = token_service_1.default.generateTokens(userdto.userId, userdto.name);
            yield token_service_1.default.saveToken(userdto.userId, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: userdto });
        });
    }
}
exports.default = new UserService();
