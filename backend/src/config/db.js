// pup-pantry/backend/src/config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
  }

  // Optional: explicit query parsing (fine for Mongoose 8+)
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri); // no deprecated options needed with Mongoose 8
    console.log("MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err?.message || err);
    process.exit(1);
  }
};

export default connectDB;
