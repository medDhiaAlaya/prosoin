import Product from "../models/Product.model.js";
import { BadRequestError, NotFoundError } from "../helpers/errors.js";

const productController = {
  createProduct: async (req, res, next) => {
    try {
      let { name, purchasePrice, price, tva, stock, barcode, ref } = req.body;

      // Debug: log raw incoming body
      try {
        // eslint-disable-next-line no-console
        console.log("[createProduct] raw body:", req.body);
      } catch (_) {}

      if (barcode) {
        const existingProduct = await Product.findOne({ barcode });
        if (existingProduct) {
          throw new BadRequestError("Product with this barcode already exists");
        }
      }

      // Coerce numeric fields safely
      const numPurchase = Number(purchasePrice);
      const numPrice = Number(price);
      const numTva = tva === undefined || tva === null || tva === "" ? 0 : Number(tva);
      const numStock = stock === undefined || stock === null || stock === "" ? 0 : Number(stock);

      try {
        // eslint-disable-next-line no-console
        console.log("[createProduct] coerced:", { numPurchase, numPrice, numTva, numStock });
      } catch (_) {}

      const product = await Product.create({
        name,
        purchasePrice: isFinite(numPurchase) ? numPurchase : 0,
        price: isFinite(numPrice) ? numPrice : 0,
        tva: isFinite(numTva) ? numTva : 0,
        stock: isFinite(numStock) ? numStock : 0,
        barcode,
        ref
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
      const products = await Product.find();
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
      const product = await Product.findById(id);
      
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
      );

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
      const product = await Product.findOne({ barcode });

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
