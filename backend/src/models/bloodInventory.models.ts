import mongoose, { Document, Schema } from "mongoose";

export interface IBloodInventory extends Document {
  inventoryId: string;
  hospitalId: string;
  bloodGroup: string;
  componentType: string;
  availableUnits: number;
  reservedUnits: number;
  lastUpdated: Date;
  isAvailable: boolean;
}

const bloodInventorySchema = new Schema<IBloodInventory>(
  {
    inventoryId: {
      type: String,
      required: true,
      unique: true,
    },

    hospitalId: {
      type: String,
      required: true,
    },

    bloodGroup: {
      type: String,
      required: true,
    },

    componentType: {
      type: String,
      required: true,
    },

    availableUnits: {
      type: Number,
      required: true,
      default: 0,
    },

    reservedUnits: {
      type: Number,
      required: true,
      default: 0,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBloodInventory>(
  "BloodInventory",
  bloodInventorySchema
);