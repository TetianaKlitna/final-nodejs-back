import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import type { TokenJwtPayload } from '../service/token-service';
import TaskModel from '../model/Task';
import TaskDTO from '../dto/task-dto';

class TaskContoller {
  async getAllTasks(req: Request, res: Response, next: NextFunction) {
    const user = req.user as TokenJwtPayload;
    const { all } = req.query;
    let tasks;

    if (all === 'true') {
      tasks = await TaskModel.find().sort('createdAt');
    } else {
      tasks = await TaskModel.find({ createdBy: user?.userId }).sort(
        'createdAt'
      );
    }
    const tasksdto = tasks.map((task) => new TaskDTO(task));
    res
      .status(StatusCodes.OK)
      .json({ success: true, count: tasksdto.length, tasks: tasksdto });
  }

  async getTask(req: Request, res: Response, next: NextFunction) {
    const user = req.user as TokenJwtPayload;
    const taskId = req.params?.id;
    if (!taskId) {
      throw new BadRequestError('Task id is required');
    }
    const task = await TaskModel.findOne({
      _id: taskId,
      createdBy: user.userId,
    });
    if (!task) {
      throw new NotFoundError(`Task not found with id: ${taskId}`);
    }
    const taskdto = new TaskDTO(task);
    res.status(StatusCodes.OK).json({ task: taskdto });
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    const user = req.user as TokenJwtPayload;
    const createdBy = user.userId;
    const { title, dueDate, description, status, priority } = req.body;
    if (!title) {
      throw new BadRequestError('Task title is required');
    }
    if (!dueDate) {
      throw new BadRequestError('Task due date is required');
    }
    const task = await TaskModel.create({
      title,
      dueDate,
      description,
      status,
      priority,
      createdBy,
    });
    const taskdto = new TaskDTO(task);
    res.status(StatusCodes.CREATED).json({ success: true, task: taskdto });
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    const user = req.user as TokenJwtPayload;
    const taskId = req.params.id;
    if (!taskId) {
      throw new BadRequestError('Task ID is required');
    }
    const task = await TaskModel.findOneAndDelete({
      _id: taskId,
      createdBy: user.userId,
    });
    if (!task) {
      throw new NotFoundError(`No task found with id: ${taskId}`);
    }
    const taskdto = new TaskDTO(task);
    return res.status(StatusCodes.OK).json({ success: true, task: taskdto });
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    const user = req.user as TokenJwtPayload;
    const taskId = req.params.id;
    if (!taskId) {
      throw new BadRequestError('Task ID is required');
    }
    const { title, dueDate, description, status, priority } = req.body;

    const task = await TaskModel.findByIdAndUpdate(
      { _id: taskId, createdBy: user.userId },
      {
        title,
        dueDate,
        description,
        status,
        priority,
      },
      { new: true, runValidators: true }
    );
    if (!task) {
      throw new NotFoundError(`No task found with id: ${taskId}`);
    }
    const taskdto = new TaskDTO(task);
    res.status(StatusCodes.OK).json({ task: taskdto });
  }
}

export default new TaskContoller();
