import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { InternalError } from "../helpers/errors.js";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "first_name is required!"],
      minLength: [2, "Minimum length of first_name is 2 characters!"],
      maxLength: [32, "Maximum length of first_name is 32 characters!"],
      cast: "first_name must be a string!",
    },
    last_name: {
      type: String,
      required: [true, "last_name is required!"],
      minLength: [
        2,
        "Minimum length of last_name is 2 characters!",
      ],
      maxLength: [
        32,
        "Maximum length of last_name is 32 characters!",
      ],
      cast: "last_name must be a string!",
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: [true, "Email already exists!"],
      maxLength: [50, "Maximum length of email is 50 characters!"],
      validate: [validator.isEmail, "Invalid email!"],
      lowercase: true,
      cast: "email must be a string!",
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minLength: [8, "Minimum length of password is 8 characters!"],
      cast: "password must be a string!",
    },
    phone: {
      type: String,
      required: [true, "Phone is required!"],
      validate: [validator.isMobilePhone, "Invalid phone number!"],
      cast: "phone must be a string!",
    },
    gender: {
      type: String,
      enum: ['male','female'],
      cast: "invalid gender!",
    },
    country: {
      type: String,
      minLength: [2, "Minimum length of country is 2 characters!"],
      maxLength: [32, "Maximum length of country is 32 characters!"],
      cast: "country must be a string!",
    },
    city: {
      type: String,
      minLength: [2, "Minimum length of city is 2 characters!"],
      maxLength: [32, "Maximum length of city is 32 characters!"],
      cast: "city must be a string!",
    },
    address: {
      type: String,
      minLength: [2, "Minimum length of address is 2 characters!"],
      maxLength: [100, "Maximum length of address is 100 characters!"],
      cast: "address must be a string!",
    },
    zip: {
      type: String,
      cast: "zip must be a string!",
    },
    photo: {
      type: String,
      default: "default.png",
      cast: "photo must be a string!",
    },
    phone_verified: {
      type: Boolean,
      default: true,
      cast: "phone_verified must be a boolean!",
    },
    email_verified: {
      type: Boolean,
      default: true,
      cast: "email_verified must be a boolean!",
    },
    role: {
      type: String,
      enum: ["ADMIN"],
      required:true,
      cast: "role must be a string!",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isNew || this.isModified("password")) {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (err) {
    throw new InternalError();
  }
});

userSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    const salt = await bcrypt.genSalt(Number(process.env.SALT_FACTOR));
    this._update.password = await bcrypt.hash(this._update.password, salt);
  }
  next();
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
