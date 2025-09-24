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
  purchasePrice: { // prix d'achat
    type: Number,
    required: [true, "Purchase price is required"],
    min: 0
  },
  price: { // prix de vente
    type: Number,
    required: [true, "Sale price is required"],
    min: 0
  },
  tva: { // TVA en %
    type: Number,
    default: 0, // ex : 19
    min: 0
  }
}, { timestamps: true });

try {
  // Debug: print loaded Product schema fields at startup
  // Note: runs once when the model is loaded
  // eslint-disable-next-line no-console
  console.log("[ProductModel] Loaded schema fields:", Object.keys(productSchema.paths));
} catch (_) {}

export default mongoose.model("Product", productSchema);
