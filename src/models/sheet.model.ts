import { QRCODE_LENGTH } from '@services/qrcode.service';
import mongoose, { Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

export interface ISheet extends mongoose.Document {
  _id: string;
  fname: string;
  lname: string;
  dateOfBirth: Date;
  nationality: string;
  hidden: boolean;
  isInUse: boolean;
  bloodType: string;
  smoker: boolean;
  organDonor: boolean;
  advanceDirectives: boolean;
  allergies: string;
  medicalHistory: string;
  currentTreatment: string;
  treatingDoctor: string;
  emergencyContact1: string;
  emergencyContact2: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export type ISheetModel = mongoose.Model<ISheet>;

const sheetModel: mongoose.Schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      minLength: QRCODE_LENGTH,
      maxLength: QRCODE_LENGTH,
      trim: true,
      uppercase: true,
    },
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
    dateOfBirth: {
      type: Date,
      //TODO  required: true,
    },
    nationality: {
      type: String,
      //TODO  required: true,
      //TODO  minLength: 1,
      trim: true,
    },
    hidden: {
      type: Boolean,
      required: true,
      default: true,
    },
    isInUse: {
      type: Boolean,
      required: true,
      default: false,
    },
    bloodType: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    smoker: {
      type: Boolean,
      default: false,
    },
    organDonor: {
      type: Boolean,
      default: false,
    },
    advanceDirectives: {
      type: Boolean,
      default: false,
    },
    allergies: {
      type: String,
      required: true,
      trim: true,
    },
    medicalHistory: {
      type: String,
      required: true,
      trim: true,
    },
    currentTreatment: {
      type: String,
      required: true,
      trim: true,
    },
    treatingDoctor: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContact1: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContact2: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

sheetModel.plugin(autopopulate);

export default mongoose.model<ISheet>('Sheet', sheetModel);
