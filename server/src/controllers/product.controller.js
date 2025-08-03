import Product from "../models/Product.model.js";
import { BadRequestError, NotFoundError } from "../helpers/errors.js";

const productController = {
  createProduct: async (req, res, next) => {
    try {
      const { name, price, stock, barcode, category } = req.body;

      if (barcode) {
        const existingProduct = await Product.findOne({ barcode });
        if (existingProduct) {
          throw new BadRequestError("Product with this barcode already exists");
        }
      }

      const product = await Product.create({
        name,
        price,
        stock,
        barcode,
        category
      });

      return res.status(201).json({
        message: "Product created successfully",
        product
      });
    } catch (err) {
      next(err);
    }
  },

  getAllProducts: async (req, res, next) => {
    try {
      const products = await Product.find().populate("category");
      return res.status(200).json({
        message: "Success",
        products
      });
    } catch (err) {
      next(err);
    }
  },

  getProductById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id).populate("category");
      
      if (!product) {
        throw new NotFoundError("Product not found");
      }

      return res.status(200).json({
        message: "Success",
        product
      });
    } catch (err) {
      next(err);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.barcode) {
        const existingProduct = await Product.findOne({ 
          barcode: updates.barcode,
          _id: { $ne: id }
        });
        if (existingProduct) {
          throw new BadRequestError("Product with this barcode already exists");
        }
      }

      const product = await Product.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).populate("category");

      if (!product) {
        throw new NotFoundError("Product not found");
      }

      return res.status(200).json({
        message: "Product updated successfully",
        product
      });
    } catch (err) {
      next(err);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        throw new NotFoundError("Product not found");
      }

      return res.status(200).json({
        message: "Product deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  getProductByBarcode: async (req, res, next) => {
    try {
      const { barcode } = req.params;
      const product = await Product.findOne({ barcode }).populate("category");

      if (!product) {
        throw new NotFoundError("Product not found");
      }

      return res.status(200).json({
        message: "Success",
        product
      });
    } catch (err) {
      next(err);
    }
  },

  updateStock: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        throw new NotFoundError("Product not found");
      }

      product.stock += quantity;
      if (product.stock < 0) {
        throw new BadRequestError("Insufficient stock");
      }

      await product.save();

      return res.status(200).json({
        message: "Stock updated successfully",
        product
      });
    } catch (err) {
      next(err);
    }
  }
};

export default productController;
