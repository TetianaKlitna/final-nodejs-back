import jwt, { SignOptions } from 'jsonwebtoken';
import type { User, UserMethods } from './types/User.types';
import { Schema, model, HydratedDocument, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

type UserDoc = HydratedDocument<User>;
type UserModel = Model<User, {}, UserMethods>;

const userSchema = new Schema<User, UserModel, UserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: 5,
      maxlength: 20,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide valid email',
      ],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 5,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (this: UserDoc) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.createJWT = function (this: UserDoc): string {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_LIFETIME! as SignOptions['expiresIn'];
  return jwt.sign({ userId: this._id.toString(), name: this.name }, secret, {
    expiresIn,
  });
};

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default model<User, UserModel>('User', userSchema);
