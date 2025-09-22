import type { TaskDoc } from '../model/Task';
import type { Status } from '../model/Task';

export default class TaskDTO {
  taskId: string;
  title: string;
  dueDate: Date;
  status: Status;

  constructor(model: TaskDoc) {
    this.taskId = model._id.toString();
    this.title = model.title;
    this.dueDate = model.dueDate;
    this.status = model.status;
  }
}
