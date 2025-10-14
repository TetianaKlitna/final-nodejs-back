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
const errors_1 = require("../errors");
const Task_1 = __importDefault(require("../model/Task"));
const task_dto_1 = __importDefault(require("../dto/task-dto"));
class TaskContoller {
    getAllTasks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const { all } = req.query;
            let tasks;
            if (all === 'true') {
                tasks = yield Task_1.default.find().sort('createdAt');
            }
            else {
                tasks = yield Task_1.default.find({ createdBy: user === null || user === void 0 ? void 0 : user.userId }).sort('createdAt');
            }
            const tasksdto = tasks.map((task) => new task_dto_1.default(task));
            res
                .status(http_status_codes_1.StatusCodes.OK)
                .json({ success: true, count: tasksdto.length, tasks: tasksdto });
        });
    }
    getTask(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = req.user;
            const taskId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
            if (!taskId) {
                throw new errors_1.BadRequestError('Task id is required');
            }
            const task = yield Task_1.default.findOne({
                _id: taskId,
                createdBy: user.userId,
            });
            if (!task) {
                throw new errors_1.NotFoundError(`Task not found with id: ${taskId}`);
            }
            const taskdto = new task_dto_1.default(task);
            res.status(http_status_codes_1.StatusCodes.OK).json({ task: taskdto });
        });
    }
    createTask(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const createdBy = user.userId;
            const { title, dueDate, description, status, priority } = req.body;
            if (!title) {
                throw new errors_1.BadRequestError('Task title is required');
            }
            if (!dueDate) {
                throw new errors_1.BadRequestError('Task due date is required');
            }
            const task = yield Task_1.default.create({
                title,
                dueDate,
                description,
                status,
                priority,
                createdBy,
            });
            const taskdto = new task_dto_1.default(task);
            res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, task: taskdto });
        });
    }
    deleteTask(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const taskId = req.params.id;
            if (!taskId) {
                throw new errors_1.BadRequestError('Task ID is required');
            }
            const task = yield Task_1.default.findOneAndDelete({
                _id: taskId,
                createdBy: user.userId,
            });
            if (!task) {
                throw new errors_1.NotFoundError(`No task found with id: ${taskId}`);
            }
            const taskdto = new task_dto_1.default(task);
            return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, task: taskdto });
        });
    }
    updateTask(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const taskId = req.params.id;
            if (!taskId) {
                throw new errors_1.BadRequestError('Task ID is required');
            }
            const { title, dueDate, description, status, priority } = req.body;
            const task = yield Task_1.default.findByIdAndUpdate({ _id: taskId, createdBy: user.userId }, {
                title,
                dueDate,
                description,
                status,
                priority,
            }, { new: true, runValidators: true });
            if (!task) {
                throw new errors_1.NotFoundError(`No task found with id: ${taskId}`);
            }
            const taskdto = new task_dto_1.default(task);
            res.status(http_status_codes_1.StatusCodes.OK).json({ task: taskdto });
        });
    }
}
exports.default = new TaskContoller();
