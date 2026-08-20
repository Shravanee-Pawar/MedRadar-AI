import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: string;
  gender?: string;
  dateOfBirth?: string;

  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
    },

    dateOfBirth: {
      type: String,
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    isActive: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;