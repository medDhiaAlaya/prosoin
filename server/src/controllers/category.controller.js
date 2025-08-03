import Category from "../models/Category.model.js";
import { BadRequestError, NotFoundError } from "../helpers/errors.js";

const categoryController = {
  createCategory: async (req, res, next) => {
    try {
      const { name, description, color } = req.body;
      
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        throw new BadRequestError("Category with this name already exists");
      }

      const category = await Category.create({
        name,
        description,
        color
      });

      return res.status(201).json({
        message: "Category created successfully",
        category
      });
    } catch (err) {
      next(err);
    }
  },

  getAllCategories: async (req, res, next) => {
    try {
      const categories = await Category.find();
      return res.status(200).json({
        message: "Success",
        categories
      });
    } catch (err) {
      next(err);
    }
  },

  getCategoryById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      
      if (!category) {
        throw new NotFoundError("Category not found");
      }

      return res.status(200).json({
        message: "Success",
        category
      });
    } catch (err) {
      next(err);
    }
  },

  updateCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.name) {
        const existingCategory = await Category.findOne({ 
          name: updates.name,
          _id: { $ne: id }
        });
        if (existingCategory) {
          throw new BadRequestError("Category with this name already exists");
        }
      }

      const category = await Category.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      return res.status(200).json({
        message: "Category updated successfully",
        category
      });
    } catch (err) {
      next(err);
    }
  },

  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      return res.status(200).json({
        message: "Category deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }
};

export default categoryController;
