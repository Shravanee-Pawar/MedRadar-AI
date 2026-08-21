import mongoose, { Schema, Document } from "mongoose";

interface IEmergencyRequest extends Document {
  requestId: string;
  userId: string;
  emergencyType: string;
  severity: string;
  patientName: string;
  patientAge: number;

  patientLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };

  requiredResources: string[];
  preferredHospitalId: string;
  recommendedHospitalId: string;
  ambulanceRequired: boolean;
  status: string;
}

const emergencyRequestSchema = new Schema<IEmergencyRequest>(
  {
    requestId: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    emergencyType: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      required: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    patientAge: {
      type: Number,
      required: true,
    },

    patientLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },

    requiredResources: {
      type: [String],
      default: [],
    },

    preferredHospitalId: {
      type: String,
    },

    recommendedHospitalId: {
      type: String,
    },

    ambulanceRequired: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEmergencyRequest>(
  "EmergencyRequest",
  emergencyRequestSchema
);