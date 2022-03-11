import userModel from '@models/user.model';
import { QRCODE_LENGTH } from '@services/sheet.service';
import mongoose, { Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

type IDoctorContact = {
  fname: string;
  lname: string;
  phone: string;
};

const DoctorContactSchema = {
  fname: {
    type: String,
    trim: true,
  },
  lname: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
};

type IContact = {
  fname: string;
  lname: string;
  role: string;
  phone: string;
};

const ContactSchema = {
  fname: {
    type: String,
    trim: true,
  },
  lname: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
};

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
  treatingDoctor: IDoctorContact;
  emergencyContacts: IContact[];
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
    treatingDoctor: DoctorContactSchema,
    emergencyContacts: [ContactSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: userModel,
      autopopulate: true,
    },
  },
  { timestamps: true },
);

sheetModel.plugin(autopopulate);

export default mongoose.model<ISheet>('Sheet', sheetModel);
