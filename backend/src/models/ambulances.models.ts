import mongoose, { Document, Schema } from "mongoose";

export interface IAmbulance extends Document {
  ambulanceId: string;
  hospitalId?: string;
  vehicleNumber: string;
  ambulanceType: string;
  driverName: string;
  driverPhone: string;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  hospitalLinked: boolean;
  status: string;
}

const ambulanceSchema = new Schema<IAmbulance>(
  {
    ambulanceId: {
      type: String,
      required: true,
      unique: true,
    },

    hospitalId: {
      type: String,
      required: false,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },

    ambulanceType: {
      type: String,
      required: true,
    },

    driverName: {
      type: String,
      required: true,
    },

    driverPhone: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    currentLocation: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },

    hospitalLinked: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      required: true,
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAmbulance>(
  "Ambulance",
  ambulanceSchema
);