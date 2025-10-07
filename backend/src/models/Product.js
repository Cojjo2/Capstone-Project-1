import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    // Ingredients contained in the product
    ingredients: [{ type: Schema.Types.ObjectId, ref: "Ingredient", index: true }],
    imageUrl: { type: String, trim: true },        // optional
    description: { type: String, trim: true },     // optional
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// helpful compound indexes for filtering
productSchema.index({ brandId: 1, name: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
