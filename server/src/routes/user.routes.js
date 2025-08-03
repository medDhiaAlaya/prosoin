import express from "express";
import userController from "../controllers/user.controller.js";
import Auth from "../middlewares/auth.js";
import { genericUploader } from "../middlewares/uploader.js";

const router = express.Router();

router.route("/login").post(userController.login);
router.route("/reset-password").put(userController.resetPassword);
router.route("/me")
  .get(Auth.verifyToken, userController.userDetails)
  .put(Auth.verifyToken, genericUploader.single("photo"), userController.updateUserDetails)
  .delete(Auth.verifyToken, userController.deleteUser);

router.route("/me/update-password")
  .put(Auth.verifyToken, userController.updatePassword);

router.route("/me/photo")
  .put(Auth.verifyToken, genericUploader.single("photo"), userController.updatePhoto)
  .delete(Auth.verifyToken, userController.deletePhoto);
router.route("/register")
  .post(Auth.verifyToken, Auth.verifyAdmin, userController.register);

router.route("/admin-register")
  .post(Auth.verifyToken, Auth.verifyAdmin, userController.adminRegister);

router.route("/:id")
  .get(Auth.verifyToken, userController.getUserById)
  .put(Auth.verifyToken, Auth.verifyAdmin, userController.updateUser)
  .delete(Auth.verifyToken, Auth.verifyAdmin, userController.deleteUserById);

export default router;
