"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TaskDTO {
    constructor(model) {
        var _a;
        this.taskId = model._id.toString();
        this.title = model.title;
        this.dueDate = model.dueDate;
        this.status = model.status;
        this.priority = model.priority;
        this.description = (_a = model.description) !== null && _a !== void 0 ? _a : '';
    }
}
exports.default = TaskDTO;
