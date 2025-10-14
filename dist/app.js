"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_xss_sanitizer_1 = require("express-xss-sanitizer");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const not_found_1 = __importDefault(require("./middleware/not-found"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
const passport_1 = __importDefault(require("./config/passport"));
const app = (0, express_1.default)();
const corsOptions = {
    origin: [process.env.CLIENT_URL || ''],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(express_1.default.json());
// security
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use((0, express_xss_sanitizer_1.xss)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 100 requests per window
});
app.use(limiter);
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
}));
app.use(passport_1.default.initialize());
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/tasks', tasks_1.default);
app.use(not_found_1.default);
app.use(error_handler_1.default);
exports.default = app;
