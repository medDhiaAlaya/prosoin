import mongoose from "mongoose";

const purchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    type: String,
    required: true
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
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    salePrice: {
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
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "completed"
  }
}, { timestamps: true });

export default mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
