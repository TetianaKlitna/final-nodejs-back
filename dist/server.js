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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const connect_1 = __importDefault(require("./db/connect"));
const sockets_1 = require("./sockets");
const PORT = process.env.PORT || 4000;
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, connect_1.default)(process.env.MONGO_URI);
    console.log('Success connect to the DB');
    const server = http_1.default.createServer(app_1.default);
    (0, sockets_1.initSocket)(server);
    server.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}...`);
    });
});
start().catch((e) => {
    console.error(e);
    process.exit(1);
});
