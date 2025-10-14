"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIORITY = exports.STATUS = void 0;
const mongoose_1 = require("mongoose");
exports.STATUS = {
    TODO: 'To-Do',
    IN_PROGRESS: 'In-Progress',
    DONE: 'Done',
};
exports.PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
};
const taskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Please provide task title'],
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    dueDate: {
        type: Date,
        required: [true, 'Please provide task due date'],
    },
    createdBy: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
        type: String,
        enum: exports.STATUS,
        default: exports.STATUS.TODO,
    },
    priority: {
        type: String,
        enum: exports.PRIORITY,
        default: exports.PRIORITY.MEDIUM,
    },
}, { timestamps: true });
const TaskModel = (0, mongoose_1.model)('Task', taskSchema);
exports.default = TaskModel;
