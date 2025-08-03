import PurchaseInvoice from "../models/PurchaseInvoice.model.js";
import Product from "../models/Product.model.js";
import { BadRequestError, NotFoundError } from "../helpers/errors.js";

const purchaseController = {
  createPurchase: async (req, res, next) => {
    try {
      const { invoiceNumber, supplier, items } = req.body;

      // Check for duplicate invoice number
      const existingInvoice = await PurchaseInvoice.findOne({ invoiceNumber });
      if (existingInvoice) {
        throw new BadRequestError("Invoice number already exists");
      }

      // Calculate total and update stock
      let total = 0;
      const processedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new NotFoundError(`Product ${item.product} not found`);
        }

        // Update product price and stock
        product.stock += item.quantity;
        if (item.salePrice) {
          product.price = item.salePrice;
        }
        await product.save();

        // Add to processed items
        processedItems.push({
          product: item.product,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          salePrice: item.salePrice
        });

        // Calculate total
        total += item.purchasePrice * item.quantity;
      }

      const purchase = await PurchaseInvoice.create({
        invoiceNumber,
        supplier,
        items: processedItems,
        total
      });

      return res.status(201).json({
        message: "Purchase invoice created successfully",
        purchase
      });
    } catch (err) {
      next(err);
    }
  },

  getAllPurchases: async (req, res, next) => {
    try {
      const purchases = await PurchaseInvoice.find()
        .populate("items.product", "name barcode");

      return res.status(200).json({
        message: "Success",
        purchases
      });
    } catch (err) {
      next(err);
    }
  },

  getPurchaseById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const purchase = await PurchaseInvoice.findById(id)
        .populate("items.product", "name barcode");

      if (!purchase) {
        throw new NotFoundError("Purchase invoice not found");
      }

      return res.status(200).json({
        message: "Success",
        purchase
      });
    } catch (err) {
      next(err);
    }
  },

  updatePurchase: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.invoiceNumber) {
        const existingInvoice = await PurchaseInvoice.findOne({ 
          invoiceNumber: updates.invoiceNumber,
          _id: { $ne: id }
        });
        if (existingInvoice) {
          throw new BadRequestError("Invoice number already exists");
        }
      }

      const purchase = await PurchaseInvoice.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).populate("items.product", "name barcode");

      if (!purchase) {
        throw new NotFoundError("Purchase invoice not found");
      }

      return res.status(200).json({
        message: "Purchase invoice updated successfully",
        purchase
      });
    } catch (err) {
      next(err);
    }
  },

  deletePurchase: async (req, res, next) => {
    try {
      const { id } = req.params;
      const purchase = await PurchaseInvoice.findById(id);

      if (!purchase) {
        throw new NotFoundError("Purchase invoice not found");
      }

      // Revert stock changes
      for (const item of purchase.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          if (product.stock < 0) product.stock = 0;
          await product.save();
        }
      }

      await purchase.remove();

      return res.status(200).json({
        message: "Purchase invoice deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  getPurchaseReport: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      const query = {};
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const purchases = await PurchaseInvoice.find(query)
        .populate("items.product", "name");

      const totalPurchases = purchases.reduce((acc, purchase) => acc + purchase.total, 0);
      const totalItems = purchases.reduce((acc, purchase) => 
        acc + purchase.items.reduce((sum, item) => sum + item.quantity, 0), 0);

      return res.status(200).json({
        message: "Success",
        report: {
          totalPurchases,
          totalItems,
          purchaseCount: purchases.length,
          purchases
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

export default purchaseController;
