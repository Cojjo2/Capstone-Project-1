// pup-pantry/backend/src/models/Ingredient.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ingredientSchema = new Schema(
  {
    // Remove 'unique' on the field; enforce via index below
    name: { type: String, required: true, trim: true },
    // optional synonyms to help normalization (e.g., "NaCl" vs "Salt")
    synonyms: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Single source of truth for uniqueness — avoids duplicate index warnings
ingredientSchema.index({ name: 1 }, { unique: true });
// Helpful for lookups by synonym
ingredientSchema.index({ synonyms: 1 });

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
export default Ingredient;
