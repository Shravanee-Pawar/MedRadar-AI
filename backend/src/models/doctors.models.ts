import mongoose, { Document, Schema } from "mongoose";

export interface IDoctor extends Document {
  doctorId: string;
  hospitalId?: string;
  name: string;
  specialization: string;
  qualification: string;
  phone: string;
  email: string;
  experienceYears: number;
  availability: boolean;
  isActive: boolean;
}

const doctorSchema = new Schema<IDoctor>(
  {
    doctorId: {
      type: String,
      required: true,
      unique: true,
    },

    hospitalId: {
      type: String,
      required: false,
    },

    name: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    experienceYears: {
      type: Number,
      required: true,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDoctor>(
  "Doctor",
  doctorSchema
);