import { Schema, model, Document, Model, Types } from 'mongoose';
import { TaskStatus, TaskPriority, ITask } from '../types';

export interface ITaskDocument extends Omit<ITask, 'user'>, Document {
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TaskStatus),
        message: 'Invalid task status. Allowed values: TODO, IN_PROGRESS, DONE',
      },
      default: TaskStatus.TODO,
      required: [true, 'Task status is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TaskPriority),
        message: 'Invalid task priority. Allowed values: LOW, MEDIUM, HIGH',
      },
      default: TaskPriority.MEDIUM,
      required: [true, 'Task priority is required'],
      index: true,
    },
    dueDate: {
      type: Date,
    },
    attachment: {
      fileName: { type: String, trim: true },
      fileUrl: { type: String, trim: true },
      publicId: { type: String, trim: true },
      mimeType: { type: String, trim: true },
      fileSize: { type: Number },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound indexes for optimal search and filtering per user
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, title: 1 });

// Global transformation options to sanitize JSON responses
taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (ret as any).__v;
    return ret;
  },
});

taskSchema.set('toObject', {
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (ret as any).__v;
    return ret;
  },
});

export const Task: Model<ITaskDocument> = model<ITaskDocument>('Task', taskSchema);
export default Task;
