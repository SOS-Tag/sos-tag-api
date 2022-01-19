import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

export interface IUser extends mongoose.Document {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  confirmed: boolean;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
}

export type IUserModel = mongoose.Model<IUser>;

const userModel: mongoose.Schema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: true,
    },
    tokenVersion: {
      type: Number,
      required: false,
      default: 0,
    },
    confirmed: {
      type: Boolean,
    },
    sex: {
      type: String,
      required: true
    },
    birthday: {
      type: Date,
      required: true
    },
    height: {
      type: Date,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    bloodGroup: {
      type: String,
      required: false
    },
    advancedDirective: {
      type: Boolean,
      required: false,
      default: false
    },
    smoking: {
      type: Boolean,
      required: false,
    },
    drugAllergies: {
      type: [String],
      required: false,
    },
    antecedents: {
      type: [String],
      required: false,
    },
    utdVaccines: {
      type: Boolean,
      required: false,
    },
    diabetes: {
      type: Boolean,
      required: false,
    },
    haemophilia: {
      type: Boolean,
      required: false,
    },
    epilepsy: {
      type: Boolean,
      required: false,
    },
    pacemaker: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true },
);

userModel.plugin(autopopulate);

export default mongoose.model<IUser>('User', userModel);
