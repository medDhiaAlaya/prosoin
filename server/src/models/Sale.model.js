import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card"],
    default: "cash"
  },
  status: {
    type: String,
    enum: ["completed", "cancelled", "pending"],
    default: "completed"
  }
}, { timestamps: true });

export default mongoose.model("Sale", saleSchema);
