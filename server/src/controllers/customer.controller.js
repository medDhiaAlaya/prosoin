import { BadRequestError, NotFoundError } from "../helpers/errors.js";
import CustomerModel from "../models/Customer.model.js";

const customerController = {
  getCustomersBySeller: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const customers = await CustomerModel.find({ seller: userId });
      return res.status(200).json({
        message: "Success",
        customers,
      });
    } catch (err) {
      console.log(err);
      
      next(err);
    }
  },

  getCustomerById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const customer = await CustomerModel.findOne({ _id: id, seller: userId });

      if (!customer) {
        throw new NotFoundError("Customer not found");
      }

      return res.status(200).json({
        message: "Success",
        customer,
      });
    } catch (err) {
      next(err);
    }
  },

  updateCustomer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const updates = req.body;

      const customer = await CustomerModel.findOneAndUpdate({
        _id: id,
        seller: userId,
      }, updates, {
        new: true,
        runValidators: true,
      });

      if (!customer) {
        throw new NotFoundError("Customer not found");
      }

      return res.status(200).json({
        message: "Customer updated successfully",
        customer,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteCustomer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const customer = await CustomerModel.findOneAndDelete({
        _id: id,
        seller: userId,
      });

      if (!customer) {
        throw new NotFoundError("Customer not found");
      }

      return res.status(200).json({
        message: "Customer deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};

export default customerController;
