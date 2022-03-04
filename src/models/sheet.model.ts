import { QRCODE_LENGTH } from '@services/qrcode.service';
import mongoose, { Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

export interface ISheet extends mongoose.Document {
  _id: string;
  enabled: boolean;
  fname: string;
  lname: string;
  sex: string;
  dateOfBirth: Date;
  nationality: string;
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
    enabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    fname: {
      type: String,
      minLength: 1,
      trim: true,
    },
    lname: {
      type: String,
      minLength: 1,
      trim: true,
    },
    sex: {
      type: String,
      minLength: 1,
      maxLength: 1,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    nationality: {
      type: String,
      minLength: 2,
      maxLength: 2,
      trim: true,
    },
    bloodType: {
      type: String,
      minLength: 2,
      maxLength: 3,
      trim: true,
      uppercase: true,
    },
    smoker: {
      type: Boolean,
    },
    organDonor: {
      type: Boolean,
    },
    advanceDirectives: {
      type: Boolean,
    },
    allergies: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      type: String,
      trim: true,
    },
    currentTreatment: {
      type: String,
      trim: true,
    },
    treatingDoctor: {
      type: String,
      trim: true,
    },
    emergencyContact1: {
      type: String,
      trim: true,
    },
    emergencyContact2: {
      type: String,
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
