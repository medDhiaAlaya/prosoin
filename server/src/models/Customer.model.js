import mongoose from "mongoose";
import validator from "validator";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required!"],
      minLength: [2, "Minimum length of name is 2 characters!"],
      maxLength: [32, "Maximum length of name is 32 characters!"],
      cast: "name must be a string!",
    },
    email: {
      type: String,
      unique: [true, "Email already exists!"],
      maxLength: [50, "Maximum length of email is 50 characters!"],
      validate: [validator.isEmail, "Invalid email!"],
      lowercase: true,
      cast: "email must be a string!",
    },
    phone: {
      type: String,
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
