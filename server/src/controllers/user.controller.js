import mongoose from "mongoose";
import bcrypt from "bcrypt";
import otpgenerator from "otp-generator";
import createToken from "../helpers/create_token.js";
import { v4 } from "uuid";
import {
  BadRequestError,
  GenericError,
  MissingDataError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../helpers/errors.js";
import validator from "validator";
import UserModel from "../models/User.model.js";
import deleteFiles from "../helpers/delete_files.js";

const userController = {


  register: async (req, res, next) => {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        phone,
        gender,
        country,
        city,
        address,
        zip,
        photo,
        phone_verified,
        email_verified,
        role,
      } = req.body;

      const user = UserModel({
        first_name,
        last_name,
        email,
        password,
        phone,
        gender,
        country,
        city,
        address,
        zip,
        photo,
        phone_verified,
        email_verified,
        role,
      });
      if (!user) {
        throw new GenericError();
      }
      await user.save();
      return res.status(201).json({
        message: "User created successfully!",
      });
    } catch (err) {
      next(err);
    }
  },

  adminRegister: async (req, res, next) => {
    try {
      const { first_name, last_name, email, password, phone } = req.body;
      const user = await UserModel.create({
        first_name,
        last_name,
        email,
        password,
        phone,
        role: "ADMIN",
      });
      if (!user) {
        throw new GenericError();
      }
      return res.status(201).json({
        message: "User created successfully!",
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new NotFoundError("Please check your credentials!");
      }
      const isPassowrdCorrect = await bcrypt.compare(password, user.password);
      if (!isPassowrdCorrect) {
        throw new NotFoundError("Please check your credentials!");
      }
      const token = createToken(user._id, user.role);
      return res.status(200).json({
        message: "User logged in successfully!",
        token,
        role: user.role,
        user,
      });
    } catch (err) {
      next(err);
    }
  },

  userDetails: async (req, res, next) => {
    try {
      const { userId } = req.user;
      if (!validator.isMongoId(userId)) {
        throw new ValidationError("Invalid ID");
      }
      const user = await UserModel.findById(userId).select("-password");
      if (!user) {
        throw new NotFoundError("User not exists!");
      }
      return res.status(200).json({ message: "Success!", user });
    } catch (err) {
      next(err);
    }
  },

  updateUserDetails: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const {
        first_name,
        last_name,
        phone,
        email,
        country,
        city,
        address,
        zip,
      } = req.body;
      const file = req.file;
      const data = {};
      if (!validator.isMongoId(userId)) {
        throw new ValidationError("Invalid ID");
      }
      const user = await UserModel.findById(userId).select("-password");
      if (!user) {
        throw new NotFoundError("User Not exists!");
      }
      if (first_name) {
        data.first_name = first_name;
      }
      if (last_name) {
        data.last_name = last_name;
      }
      if (phone) {
        data.phone = phone;
        data.phone_verified = false;
      }
      if (email) {
        data.email = email;
        data.email_verified = false;
      }
      if (country) {
        data.country = country;
      }
      if (city) {
        data.city = city;
      }
      if (address) {
        data.address = address;
      }
      if (zip) {
        data.zip = zip;
      }
      if (file) {
        data.photo = file.filename;
      }
      if (Object.keys(data).length === 0) {
        throw new MissingDataError("Missing data to update the user!");
      }
      Object.assign(user, data);
      await user.save();
      return res
        .status(200)
        .json({ message: "User updated successfully!", user });
    } catch (err) {
      next(err);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { userId } = req.user;
      if (!validator.isMongoId(userId)) {
        throw new ValidationError("Invalid ID");
      }
      const user = await UserModel.findByIdAndDelete(userId);
      if (!user) {
        throw new NotFoundError("User not exists!");
      }
      return res.status(200).json({ message: "User deleted successfully!" });
    } catch (err) {
      next(err);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { email, password, sessionId } = req.body;
      if (!email) {
        throw new MissingDataError("Email is required!");
      }
      if (!validator.isEmail(email)) {
        throw new ValidationError("Invalid email!");
      }
      if (!sessionId) {
        throw new UnauthorizedError("Authentification Failed!");
      }
      if (req.app.locals.sessionId !== sessionId) {
        req.app.locals.sessionId = null;
        throw new UnauthorizedError("Authentification Failed!");
      }
      req.app.locals.sessionId = null;
      const user = await UserModel.findOneAndUpdate(
        { email },
        { password },
        { runValidators: true }
      );
      if (!user) {
        throw new NotFoundError("User Not Exists!");
      }
      return res
        .status(200)
        .json({ message: "Password Updated Successfully!" });
    } catch (err) {
      next(err);
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const { old_password, new_password } = req.body;
      const { userId } = req.user;
      if (!validator.isMongoId(userId)) {
        throw new ValidationError("Invalid ID");
      }
      if (!old_password) {
        throw new MissingDataError("Old password is required!");
      }
      if (!new_password) {
        throw new MissingDataError("New password is required!");
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError("User not exists!");
      }
      const isPasswordValid = await bcrypt.compare(old_password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestError("Incorrect Password!");
      }
      await UserModel.findByIdAndUpdate(
        userId,
        { password: new_password },
        { new: true },
        { runValidators: true }
      );
      return res
        .status(200)
        .json({ message: "Password Updated Successfully!" });
    } catch (err) {
      next(err);
    }
  },

  changeEmail: async (req, res, next) => {
    try {
      const { sessionId, email } = req.body;
      const { userId } = req.user;
      if (!validator.isMongoId(userId)) {
        throw new ValidationError("Invalid ID");
      }
      if (!sessionId) {
        throw new UnauthorizedError("Authentification Failed!");
      }
      if (!email) {
        throw new MissingDataError("Email is required!");
      }
      if (!validator.isEmail(email)) {
        throw new ValidationError("Invalid email!");
      }
      if (req.app.locals.sessionId !== sessionId) {
        req.app.locals.sessionId = null;
        throw new UnauthorizedError("Authentification Failed!");
      }
      req.app.locals.sessionId = null;
      await UserModel.findByIdAndUpdate(
        userId,
        { email },
        { new: true },
        { runValidators: true }
      );
      return res.status(200).json({
        message: "Success!",
      });
    } catch (err) {
      next(err);
    }
  },

  generateOTP: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new MissingDataError("Email Is Required!");
      }
      if (!validator.isEmail(email)) {
        throw new ValidationError("Invalid email!");
      }
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new NotFoundError("User Not Exists!");
      }
      req.app.locals.OTP = otpgenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      console.log(req.app.locals.OTP);

      return res.status(200).json({ message: "Email Sent Successfully!" });
    } catch (err) {
      next(err);
    }
  },

  verifyOTP: async (req, res, next) => {
    try {
      const { code } = req.body;
      if (!code) {
        throw new MissingDataError("Code Is Required!");
      }
      if (parseInt(req.app.locals.OTP) !== parseInt(code)) {
        throw new UnauthorizedError("Wrong Code!");
      }
      req.app.locals.OTP = null;
      const sessionId = v4();
      req.app.locals.sessionId = sessionId;
      return res
        .status(200)
        .json({ sessionId, message: "Verification Successfully!" });
    } catch (err) {
      next(err);
    }
  },

  updatePhoto: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const file = req.file;
      if (!validator.isMongoId(userId)) {
        throw new ValidationError("Invalid ID");
      }
      if (!file) {
        throw new MissingDataError("Photo is required!");
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError("User not exists!");
      }
      deleteFiles.single({ filename: user.photo });
      user.photo = file.filename;
      await user.save();
      return res
        .status(200)
        .json({ message: "Photo updated successfully!", user });
    } catch (err) {
      deleteFiles.single(file);
      next(err);
    }
  },

  deletePhoto: async (req, res, next) => {
    try {
      const { userId } = req.user;
      if (!validator.isMongoId(userId)) {
        throw new ValidationError("Invalid ID");
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundError("User not exists!");
      }
      deleteFiles.single({ filename: user.photo });
      user.photo = "default.png";
      await user.save();
      return res
        .status(200)
        .json({ message: "Photo updated successfully!", user });
    } catch (err) {
      next(err);
    }
  },

  // Add to user by id
  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!validator.isMongoId(id)) {
        throw new ValidationError("Invalid ID");
      }

      const userData = req.body;
      const user = await UserModel.findByIdAndUpdate(id, userData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        throw new NotFoundError("User not found");
      }

      return res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (err) {
      next(err);
    }
  },
  // Supprimer un utilisateur par ID (admin uniquement)
  deleteUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!validator.isMongoId(id)) {
        throw new ValidationError("Invalid ID");
      }

      // Vérifier que l'admin ne se supprime pas lui-même
      if (id === req.user.userId) {
        throw new BadRequestError(
          "Pour supprimer votre propre compte, utilisez l'endpoint /users/me"
        );
      }

      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
        throw new NotFoundError("Utilisateur non trouvé");
      }

      // Si l'utilisateur a une photo, la supprimer également
      if (user.photo && user.photo !== "default.png") {
        deleteFiles.single({ filename: user.photo });
      }

      return res.status(200).json({
        message: "Utilisateur supprimé avec succès",
        deletedUser: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },
 getUserById: async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validator.isMongoId(id)) {
      throw new ValidationError("Invalid ID");
    }

    const user = await UserModel.findById(id).select("first_name last_name photo role email");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return res.status(200).json({ message: "Success", user });
  } catch (err) {
    next(err);
  }
},



};

export default userController;
