import Sale from "../models/Sale.model.js";
import Product from "../models/Product.model.js";
import { BadRequestError, NotFoundError } from "../helpers/errors.js";
import CustomerModel from "../models/Customer.model.js";

const saleController = {
  createSale: async (req, res, next) => {
    try {
      const {
        items,
        discount,
        paymentMethod,
        customerId,
        name,
        email,
        phone,
      } = req.body;
      const { userId } = req.user;

      // Generate invoice number
      const date = new Date();
      const invoiceNumber = `INV-${date
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${date.getTime().toString().slice(-4)}`;

      // Calculate total and update stock
      let total = 0;
      const processedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new NotFoundError(`Product ${item.product} not found`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestError(`Insufficient stock for ${product.name}`);
        }

        // Update stock
        product.stock -= item.quantity;
        await product.save();

        // Add to processed items
        processedItems.push({
          product: item.product,
          quantity: item.quantity,
          price: product.price,
        });

        // Calculate total
        total += product.price * item.quantity;
      }
      // Create customer if provided
      let customer = null;
      if (customerId) {
        customer =  await CustomerModel.findById(customerId);
        if (!customer) {
          throw new NotFoundError("Customer not found");
        }
      } else if (name || email || phone) {
        customer = await CustomerModel.create({
          name,
          email,
          phone,
          seller: userId,
        });
      }

      const sale = await Sale.create({
        invoiceNumber,
        items: processedItems,
        total,
        discount,
        seller: userId,
        customer: customer ? customer._id : null,
        paymentMethod,
      });
      // Update customer sales
      if (customer) {
        customer.sales.push(sale._id);
        await customer.save();
      }

      return res.status(201).json({
        message: "Sale created successfully",
        sale,
      });
    } catch (err) {
      next(err);
    }
  },

  // getAllSales: async (req, res, next) => {
  //   try {
  //     const sales = await Sale.find()
  //       .populate("seller", "first_name last_name")
  //       .populate("items.product", "name price")
  //       .populate("customer");
  //     return res.status(200).json({
  //       message: "Success",
  //       sales,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // },

  getSaleById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const sale = await Sale.findById(id)
        .populate("seller", "first_name last_name")
        .populate("items.product", "name price")
        .populate("customer");

      if (!sale) {
        throw new NotFoundError("Sale not found");
      }

      return res.status(200).json({
        message: "Success",
        sale,
      });
    } catch (err) {
      next(err);
    }
  },

  getSalesByUser: async (req, res, next) => {
    try {
      const { userId } = req.user;
      const sales = await Sale.find({ seller: userId })
        .populate("seller", "first_name last_name")
        .populate("items.product", "name price")
        .populate("customer")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Success",
        sales,
      });
    } catch (err) {
      next(err);
    }
  },

  cancelSale: async (req, res, next) => {
    try {
      const { id } = req.params;
      const sale = await Sale.findById(id);

      if (!sale) {
        throw new NotFoundError("Sale not found");
      }

      if (sale.status === "cancelled") {
        throw new BadRequestError("Sale is already cancelled");
      }

      // Restore stock
      for (const item of sale.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }

      sale.status = "cancelled";
      await sale.save();

      return res.status(200).json({
        message: "Sale cancelled successfully",
        sale,
      });
    } catch (err) {
      next(err);
    }
  },

  getSalesReport: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      const query = {};
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const sales = await Sale.find({
        ...query,
        status: "completed",
      })
        .populate("seller", "first_name last_name")
        .populate("items.product", "name price")
        .populate("customer");

      const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
      const totalItems = sales.reduce(
        (acc, sale) =>
          acc + sale.items.reduce((sum, item) => sum + item.quantity, 0),
        0
      );

      // Get top selling products
      const productSales = {};
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          const productId = item.product._id.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.product.name,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.quantity * item.price;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return res.status(200).json({
        message: "Success",
        report: {
          totalSales,
          totalItems,
          salesCount: sales.length,
          topProducts,
          sales,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

export default saleController;
