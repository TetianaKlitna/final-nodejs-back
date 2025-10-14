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
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailService {
    constructor() {
        const options = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        };
        this.transporter = nodemailer_1.default.createTransport(options);
    }
    sendActivationLink(to, link) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transporter.sendMail({
                from: `"NextTask Team" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Welcome! Please activate your account',
                text: `Hello, 
        Thank you for signing up for NextTask! 
        To get started, please activate your account by clicking the link below:

        ${link}

        If you did not create this account, please ignore this email.  

        Best regards,  
        NextTask Team`,
                html: `
            <p>Hello,</p>
            <p>Thank you for signing up for <strong>NextTask</strong>! 🎉</p>
            <p>Please activate your account by clicking the link below:</p>
            <p><a href="${link}">Activate My Account</a></p>
            <p>If you did not create this account, you can safely ignore this email.</p>
            <br/>
            <p>Best regards,<br/>NextTask Team</p>
          `,
            });
        });
    }
    sendResetPasswordLink(to, link) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transporter.sendMail({
                from: `"NextTask Team" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Password Reset Request',
                text: `Hello, 
            We received a request to reset your password. 
            You can reset it by clicking the link below:

            ${link}

            If you did not request a password reset, please ignore this message. 

            Best regards,  
            NextTask Team`,
                html: `
                <p>Hello,</p>
                <p>We received a request to reset your password.</p>
                <p>You can reset it by clicking the link below:</p>
                <p><a href="${link}">Reset Password</a></p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <br/>
                <p>Best regards,<br/>NextTask Team</p>
              `,
            });
        });
    }
}
exports.default = new MailService();
