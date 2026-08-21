import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log("⚠️ MONGODB_URI not provided. Operating in Mock Database Mode.");
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        console.log("⚠️ Operating in Mock Database Mode.");
    }
};