import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

export interface IUser extends mongoose.Document {
  fname: string;
  lname: string;
  address: string;
  zipCode: string;
  city: string;
  email: string;
  phone: string;
  nationality: string;
  password: string;
  tokenVersion: number;
  activated: boolean;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IUserModel = mongoose.Model<IUser>;

const userModel: mongoose.Schema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      minLength: 1,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      minLength: 1,
      trim: true,
    },
    address: {
      type: String,
      //TODO  required: true,
      minLength: 1,
      trim: true,
    },
    zipCode: {
      type: String,
      //TODO  required: true,
      minLength: 1,
      trim: true,
    },
    city: {
      type: String,
      //TODO  required: true,
      minLength: 1,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      //TODO  required: true,
      minLength: 1,
      trim: true,
    },
    nationality: {
      type: String,
      //TODO  required: true,
      minLength: 2,
      maxLength: 2,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 1,
    },
    tokenVersion: {
      type: Number,
      required: false,
      default: 0,
    },
    activated: {
      type: Boolean,
    },
    confirmed: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

userModel.plugin(autopopulate);

export default mongoose.model<IUser>('User', userModel);
