import mongoose from "mongoose";
import validator from "validator";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required!"],
    },
    email: {
      type: String,
      unique: [true, "Email already exists!"],
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required!"],
      cast: "seller must be a string!",
    },
    sales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
      },
    ],
  },
  { timestamps: true }
);

const CustomerModel = mongoose.model("Customer", customerSchema);
export default CustomerModel;
