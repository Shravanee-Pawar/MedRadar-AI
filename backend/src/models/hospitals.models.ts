import mongoose, { Schema, Document } from "mongoose";

export interface IHospital extends Document {
  hospitalId: string;
  name: string;
  registrationNumber: string;
  hospitalType: string;

  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  phone?: string;
  email?: string;

  latitude?: number;
  longitude?: number;

  emergencyServices?: boolean;
  specialistAvailable?: boolean;
  isVerified?: boolean;
  isActive?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    hospitalId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
    },

    hospitalType: {
      type: String,
      required: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    phone: String,

    email: String,

    latitude: Number,

    longitude: Number,

    emergencyServices: {
      type: Boolean,
      default: false,
    },

    specialistAvailable: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
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

export default mongoose.model<IHospital>("Hospital", hospitalSchema);