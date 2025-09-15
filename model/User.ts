import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';

const PROVIDER = ['local', 'google', 'facebook'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name cannot be longer than 50 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, 'Email cannot be longer than 100 characters'],
    },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    password: {
      type: String,
      // google/facebook auth users without password
      required: function (this: HydratedDocument<User>) {
        return this.provider === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    provider: {
      type: String,
      required: true,
      enum: PROVIDER,
      default: 'local',
    },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<User>;

const UserModel = model<User>('User', userSchema);
export default UserModel;
