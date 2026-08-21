import mongoose, { Schema, Document } from "mongoose";

interface INotification extends Document {
  notificationId: string;
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType: string;
  relatedEntityId: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  notificationId: {
    type: String,
    required: true,
  },

  recipientUserId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  relatedEntityType: {
    type: String,
  },

  relatedEntityId: {
    type: String,
  },

  isRead: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);