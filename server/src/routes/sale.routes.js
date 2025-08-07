import express from "express";
import saleController from "../controllers/sale.controller.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(Auth.verifyToken);

router.route("/")
  .post(saleController.createSale)
  // .get(saleController.getAllSales);

router.route("/me").get(saleController.getSalesByUser);

router.get("/report", saleController.getSalesReport);

router.route("/:id")
  .get(saleController.getSaleById)
  .put(saleController.cancelSale);

export default router;
