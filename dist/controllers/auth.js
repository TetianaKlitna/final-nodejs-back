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
const http_status_codes_1 = require("http-status-codes");
const user_service_1 = __importDefault(require("../service/user-service"));
const express_validator_1 = require("express-validator");
const ms_1 = __importDefault(require("ms"));
const uuid_1 = __importDefault(require("uuid"));
const passport_1 = __importDefault(require("../config/passport"));
const errors_1 = require("../errors");
class AuthController {
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    msg: errors
                        .array()
                        .map(err => err.msg)
                        .join(', ')
                });
            }
            const { name, email, password } = req.body;
            yield user_service_1.default.registration(name, email, password);
            res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true });
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const userData = yield user_service_1.default.login(email, password);
            const expiresIn = process.env.JWT_REFRESH_LIFETIME || '2d';
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: (0, ms_1.default)(expiresIn),
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            });
            res.status(http_status_codes_1.StatusCodes.OK).json(Object.assign({}, userData));
        });
    }
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.cookies;
            yield user_service_1.default.logout(refreshToken);
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true });
        });
    }
    activate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const activationLink = req.params.link;
            yield user_service_1.default.activate(activationLink);
            return res.redirect(`${process.env.CLIENT_URL}/login`);
        });
    }
    refresh(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.cookies;
            const userData = yield user_service_1.default.refresh(refreshToken);
            const expiresIn = process.env.JWT_REFRESH_LIFETIME || '2d';
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: (0, ms_1.default)(expiresIn),
                httpOnly: true
            });
            res.status(http_status_codes_1.StatusCodes.OK).json(Object.assign({}, userData));
        });
    }
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            yield user_service_1.default.forgotPassword(email);
            res.status(http_status_codes_1.StatusCodes.OK).json({ success: true });
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, token, newPassword } = req.body;
            yield user_service_1.default.resetPassword(email, token, newPassword);
            res.status(http_status_codes_1.StatusCodes.OK).json({ success: true });
        });
    }
    getCurrentUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accessToken } = req.cookies;
            const userData = yield user_service_1.default.getCurrentUser(accessToken);
            res.status(http_status_codes_1.StatusCodes.OK).json(Object.assign({}, userData));
        });
    }
    googleAuth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = uuid_1.default.v4();
            res.cookie('oauthState', state, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 15 * 60 * 1000 // 15 min
            });
            passport_1.default.authenticate('google', {
                scope: ['email', 'profile'],
                state,
                session: false
            })(req, res, next);
        });
    }
    googleCallback(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            passport_1.default.authenticate('google', { session: false }, (err, userProfile) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                if (err)
                    return next(err);
                if (!userProfile)
                    return res.redirect(`${process.env.CLIENT_URL}/login?auth=failed`);
                const cookieState = req.cookies['oauthState'];
                const stateFromGoogle = req.query.state;
                if (!cookieState || cookieState !== stateFromGoogle) {
                    return res.redirect(`${process.env.CLIENT_URL}/login?auth=state_mismatch`);
                }
                res.clearCookie('oauthState', { path: '/' });
                const email = (_d = (_c = (_b = (_a = userProfile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.trim()) === null || _d === void 0 ? void 0 : _d.toLowerCase();
                const name = `${(_e = userProfile.name) === null || _e === void 0 ? void 0 : _e.givenName} ${(_f = userProfile.name) === null || _f === void 0 ? void 0 : _f.familyName}`;
                const googleId = userProfile.id;
                if (!googleId) {
                    return res.redirect(`${process.env.CLIENT_URL}/login?auth=missing_id`);
                }
                let userData;
                try {
                    userData = yield user_service_1.default.googleLogin(email, name, googleId);
                }
                catch (error) {
                    console.error(error);
                    if (error instanceof errors_1.BadRequestError &&
                        error.message === 'This email is already registered.') {
                        return res.redirect(`${process.env.CLIENT_URL}/login?auth=email_exists`);
                    }
                    return res.redirect(`${process.env.CLIENT_URL}/login?auth=user_error`);
                }
                const expiresInAccess = process.env.JWT_ACCESS_LIFETIME || '30m';
                const expiresInRefresh = process.env.JWT_REFRESH_LIFETIME || '2d';
                res.cookie('accessToken', userData.accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: (0, ms_1.default)(expiresInAccess)
                });
                res.cookie('refreshToken', userData.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    path: '/auth/refresh',
                    maxAge: (0, ms_1.default)(expiresInRefresh)
                });
                return res.redirect(`${process.env.CLIENT_URL}`);
            }))(req, res, next);
        });
    }
}
exports.default = new AuthController();
