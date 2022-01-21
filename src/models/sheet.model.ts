import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { MedData } from '@/schemas/sheet.schema';

export interface ISheet extends mongoose.Document {
  _id: string;
  fname: string;
  lname: string;
  dateOfBirth: Date;
  nationality: string;
  medData: MedData;
  hidden: boolean;
  isInUse: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ISheetModel = mongoose.Model<ISheet>;

const sheetModel: mongoose.Schema = new mongoose.Schema(
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
    dateOfBirth: {
      type: Date,
      required: true,
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
    medData: {
      type: MedData,
      required: true,
    },
    hidden: {
      type: Boolean,
      required: true,
      default: true,
    },
    isInUse: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

sheetModel.plugin(autopopulate);

export default mongoose.model<ISheet>('Sheet', sheetModel);
