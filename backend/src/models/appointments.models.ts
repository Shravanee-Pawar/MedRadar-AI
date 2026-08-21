import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  appointmentId: string;
  userId: string;
  doctorId: string;
  hospitalId: string;
  department: string;
  appointmentDate: Date;
  appointmentTime: string;
  reason: string;
  status: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    appointmentId: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    doctorId: {
      type: String,
      required: true,
    },

    hospitalId: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentTime: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
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

export default mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);