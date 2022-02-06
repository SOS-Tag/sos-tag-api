import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

export interface IUser extends mongoose.Document {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IUserModel = mongoose.Model<IUser>;

const userModel: mongoose.Schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
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
    confirmed: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

userModel.plugin(autopopulate);

export default mongoose.model<IUser>('User', userModel);
