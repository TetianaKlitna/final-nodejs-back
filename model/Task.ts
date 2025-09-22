import {
  Schema,
  InferSchemaType,
  model,
  HydratedDocument,
  Types,
} from 'mongoose';

const STATUS = ['To-Do', 'In-Progress', 'Done'];
const PRIORITY = ['Low', 'Medium', 'High'];

export type Status = (typeof STATUS)[number];
export type Priority = (typeof PRIORITY)[number];

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
      default: STATUS[0],
    },
    priority: {
      type: String,
      enum: PRIORITY,
      default: PRIORITY[1],
    },
  },
  { timestamps: true }
);

export type Task = InferSchemaType<typeof taskSchema>;
export type TaskDoc = HydratedDocument<Task>;

const TaskModel = model<Task>('Task', taskSchema);
export default TaskModel;
