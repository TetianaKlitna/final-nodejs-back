import type { TaskDoc } from '../model/Task';
import type { Status, Priority } from '../model/Task';

export default class TaskDTO {
  taskId: string;
  title: string;
  dueDate: Date;
  status: Status;
  priority: Priority;
  description: string;

  constructor(model: TaskDoc) {
    this.taskId = model._id.toString();
    this.title = model.title;
    this.dueDate = model.dueDate;
    this.status = model.status;
    this.priority = model.priority;
    this.description = model.description ?? '';
  }
}
