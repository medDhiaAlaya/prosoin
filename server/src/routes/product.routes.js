import express from "express";
import productController from "../controllers/product.controller.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(Auth.verifyToken);

router.route("/")
  .post(productController.createProduct)
  .get(productController.getAllProducts);

router.route("/:id")
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

router.get("/barcode/:barcode", productController.getProductByBarcode);
router.put("/:id/stock", productController.updateStock);

export default router;
