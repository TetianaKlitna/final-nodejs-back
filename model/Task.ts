import {
  Schema,
  InferSchemaType,
  model,
  HydratedDocument,
  Types,
} from 'mongoose';

export const STATUS = {
  TODO: 'To-Do',
  IN_PROGRESS: 'In-Progress',
  DONE: 'Done',
} as const;

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;


export type Status = (typeof STATUS)[keyof typeof STATUS];
export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

const taskSchema = new Schema(
  {
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
      type: Types.ObjectId,
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
      enum: STATUS,
      default: STATUS.TODO,
    },
    priority: {
      type: String,
      enum: PRIORITY,
      default: PRIORITY.MEDIUM,
    },
  },
  { timestamps: true }
);

export type Task = InferSchemaType<typeof taskSchema>;
export type TaskDoc = HydratedDocument<Task>;

const TaskModel = model<Task>('Task', taskSchema);
export default TaskModel;
