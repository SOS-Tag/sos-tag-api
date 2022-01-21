import mongoose, { Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import Sheet from '@/schemas/sheet.schema';

export interface IUser extends mongoose.Document {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  nationality: string;
  password: string;
  tokenVersion: number;
  activated: boolean;
  confirmed: boolean;
  sheets: Sheet[];
  createdAt: string;
  updatedAt: string;
}

export type IUserModel = mongoose.Model<IUser>;

const userModel: mongoose.Schema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
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
      required: true,
      trim: true,
    },
    nationality: {
      type: String,
      //TODO remove  required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
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
    sheets: {
      type: Schema.Types.ObjectId,
      ref: 'Sheet',
      required: true,
    },
  },
  { timestamps: true },
);

userModel.plugin(autopopulate);

export default mongoose.model<IUser>('User', userModel);
