import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hospitalDB");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Failed to connect to DB:", error.message);
        process.exit(1);
    }
}