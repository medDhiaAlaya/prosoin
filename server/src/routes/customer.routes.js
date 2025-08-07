import express from "express";
import Auth from "../middlewares/auth.js";
import customerController from "../controllers/customer.controller.js";

const router = express.Router();

router.use(Auth.verifyToken);

router.route("/me")
  .get(customerController.getCustomersBySeller)

router.route("/:id")
  .get(customerController.getCustomerById)
  .put(customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

export default router;
