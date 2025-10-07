import mongoose from "mongoose";

const { Schema } = mongoose;

const dogSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    breed: { type: String, trim: true },
    age: { type: Number, min: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Ingredient restrictions (IDs of Ingredient docs)
    restrictions: [{ type: Schema.Types.ObjectId, ref: "Ingredient" }],
    // Soft delete flag
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Dog = mongoose.model("Dog", dogSchema);
export default Dog;
