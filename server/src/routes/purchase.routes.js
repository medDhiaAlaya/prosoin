import express from "express";
import purchaseController from "../controllers/purchase.controller.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(Auth.verifyToken);

router.route("/")
  .post(purchaseController.createPurchase)
  .get(purchaseController.getAllPurchases);

router.get("/report", purchaseController.getPurchaseReport);

router.route("/:id")
  .get(purchaseController.getPurchaseById)
  .put(purchaseController.updatePurchase)
  .delete(purchaseController.deletePurchase);

export default router;
