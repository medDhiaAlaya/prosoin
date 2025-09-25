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
    },
    // TVA rate captured at time of sale (percentage, e.g., 19 for 19%)
    tva: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  // Legacy: gross total before discount and taxes if previously used
  total: {
    type: Number,
    required: true,
    min: 0
  },
  // New computed totals
  totalHT: { // sum of line price * qty (hors taxes)
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: { // absolute value of remise
    type: Number,
    default: 0,
    min: 0
  },
  totalTax: { // total TVA amount
    type: Number,
    default: 0,
    min: 0
  },
  totalTTC: { // total to pay (TTC)
    type: Number,
    default: 0,
    min: 0
  },
  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: false
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
