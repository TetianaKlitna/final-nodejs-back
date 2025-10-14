"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const require_auth_1 = __importDefault(require("../middleware/require-auth"));
const tasks_1 = __importDefault(require("../controllers/tasks"));
const taskRouter = express_1.default.Router();
taskRouter.use(require_auth_1.default);
taskRouter
    .route('/')
    .post(tasks_1.default.createTask)
    .get(tasks_1.default.getAllTasks);
taskRouter
    .route('/:id')
    .get(tasks_1.default.getTask)
    .delete(tasks_1.default.deleteTask)
    .patch(tasks_1.default.updateTask);
exports.default = taskRouter;
