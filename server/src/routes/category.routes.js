import express from "express";
import categoryController from "../controllers/category.controller.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(Auth.verifyToken);

router.route("/")
  .post(categoryController.createCategory)
  .get(categoryController.getAllCategories);

router.route("/:id")
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

export default router;
