// pup-pantry/backend/src/models/Store.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const storeSchema = new Schema(
  {
    // No 'unique' on the field; we enforce uniqueness via the index below.
    name: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    location: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Single source of truth for uniqueness — avoids duplicate index warnings
storeSchema.index({ name: 1 }, { unique: true });

const Store = mongoose.model("Store", storeSchema);
export default Store;
