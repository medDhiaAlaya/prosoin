import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  ref: {
    type: String,
    unique: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0
  },
  
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
