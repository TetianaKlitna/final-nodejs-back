import express from 'express';
import requireAuth from '../middleware/require-auth';
import taskController from '../controllers/tasks';

const taskRouter = express.Router();

taskRouter.use(requireAuth);

taskRouter
  .route('/')
  .post(taskController.createTask)
  .get(taskController.getAllTasks);

taskRouter
  .route('/:id')
  .get(taskController.getTask)
  .delete(taskController.deleteTask)
  .patch(taskController.updateTask);

export default taskRouter;
