import { Schema, model, Document, Model } from 'mongoose';
import { IUser } from '../types';

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Ensures password is omitted from default queries
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Global transformation options to sanitize JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (ret as any).password;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (ret as any).__v;
    return ret;
  },
});

userSchema.set('toObject', {
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (ret as any).password;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (ret as any).__v;
    return ret;
  },
});

export const User: Model<IUserDocument> = model<IUserDocument>('User', userSchema);
export default User;
