import mongoose from "mongoose";
import { CustomError } from "./errors.js";

const handleErrors = (err, _, res, __) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists!` });
  }
  if (err instanceof mongoose.Error) {
    if (err.message.includes("Cast to ObjectId")) {
      return res.status(400).json({ message: "Invalid id" });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.log("====================================");
  console.log(err);
  console.log("====================================");
  const message = err.message || err.error || "Internal Error";
  return res.status(500).json({ message });
};
export default handleErrors;
