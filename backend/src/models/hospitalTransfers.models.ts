import mongoose, { Document, Schema } from "mongoose";

export interface IHospitalTransfer extends Document {
  transferId: string;
  emergencyRequestId: string;
  patientUserId: string;
  fromHospitalId: string;
  toHospitalId: string;
  reason: string;
  ambulanceId: string;
  status: string;
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}

const hospitalTransferSchema = new Schema<IHospitalTransfer>(
  {
    transferId: {
      type: String,
      required: true,
      unique: true,
    },

    emergencyRequestId: {
      type: String,
      required: true,
    },

    patientUserId: {
      type: String,
      required: true,
    },

    fromHospitalId: {
      type: String,
      required: true,
    },

    toHospitalId: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    ambulanceId: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      default: "pending",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IHospitalTransfer>(
  "HospitalTransfer",
  hospitalTransferSchema
);