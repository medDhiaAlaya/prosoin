import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
