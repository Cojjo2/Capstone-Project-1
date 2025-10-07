// pup-pantry/backend/src/models/Brand.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const brandSchema = new Schema(
  {
    // No 'unique' on the field itself; we enforce uniqueness via the index below.
    name: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Single source of truth for uniqueness — avoids duplicate index warnings
brandSchema.index({ name: 1 }, { unique: true });

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;
