import mongoose, { Document, Schema } from "mongoose";

export interface IHospitalResource extends Document {
  resourceId: string;
  hospitalId: string;
  resourceType: string;
  resourceName: string;
  totalQuantity: number;
  availableQuantity: number;
  occupiedQuantity: number;
  status: string;
  lastUpdated: Date;
}

const hospitalResourceSchema = new Schema<IHospitalResource>(
  {
    resourceId: {
      type: String,
      required: true,
      unique: true,
    },

    hospitalId: {
      type: String,
      required: true,
    },

    resourceType: {
      type: String,
      required: true,
    },

    resourceName: {
      type: String,
      required: true,
    },

    totalQuantity: {
      type: Number,
      required: true,
    },

    availableQuantity: {
      type: Number,
      required: true,
    },

    occupiedQuantity: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.model<IHospitalResource>(
  "HospitalResource",
  hospitalResourceSchema
);