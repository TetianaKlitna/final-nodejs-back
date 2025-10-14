"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = __importDefault(require("../controllers/auth"));
const authRouter = express_1.default.Router();
authRouter.post('/register', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
        .withMessage('Password must be at least 8 chars and include uppercase, lowercase, number, and symbol.')
], auth_1.default.register);
authRouter.post('/login', auth_1.default.login);
authRouter.post('/logout', auth_1.default.logout);
authRouter.get('/activate/:link', auth_1.default.activate);
authRouter.get('/refresh', auth_1.default.refresh);
authRouter.post('/forgotPassword', auth_1.default.forgotPassword);
authRouter.post('/resetPassword', auth_1.default.resetPassword);
authRouter.get('/google', auth_1.default.googleAuth);
authRouter.get('/google/callback', auth_1.default.googleCallback);
authRouter.get('/user', auth_1.default.getCurrentUser);
exports.default = authRouter;
