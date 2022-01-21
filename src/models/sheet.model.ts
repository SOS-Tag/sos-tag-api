import mongoose, { Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

type MedDataElement = {
  value: string;
  hidden: boolean;
};

const MedDataElementSchema = new mongoose.Schema({
  value: String,
  hidden: Boolean,
});

export interface ISheet extends mongoose.Document {
  _id: string;
  fname: string;
  lname: string;
  dateOfBirth: Date;
  nationality: string;
  medData: MedDataElement;
  activated: boolean;
  affectedTo: number;
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
      type: [MedDataElementSchema],
      required: true,
    },
    activated: {
      type: Boolean,
      required: true,
      default: true,
    },
    affectedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

sheetModel.plugin(autopopulate);

export default mongoose.model<ISheet>('Sheet', sheetModel);
