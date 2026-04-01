const FaqCategoryModel = require("../../models/faq/faqCategoryModel");
const FaqContentModel = require("../../models/faq/faqContentModel")
const mongoose = require("mongoose")

const createCategory = async (req, res) => {
  try {
    const { title } = req.body;

    const newCategory = new FaqCategoryModel({
      title,
    });

    await newCategory.save();

    return res.status(200).json({
      message: "Category added successfully.",
      newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding Category due to ${error.message}`,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { _id } = req.params;
    const { title} = req.body;

    const currentCategory = await FaqCategoryModel.findById(_id);
    if (!currentCategory) {
      return res
        .status(404)
        .json({ message: "Category not found." });
    }

    const updatedFields = { title };

    const updatedCategory =
      await FaqCategoryModel.findByIdAndUpdate(_id, updatedFields, {
        new: true,
      });

    return res.status(200).json({
      message: "Category updated successfully.",
      updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating Category due to ${error.message}`,
    });
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await FaqCategoryModel.findById(
      req.params._id
    );

    if (!category) {
      return res.status(400).json({
        message: "No Category is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "Category fetched successfully.",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Category due to ${error.message}`,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await FaqCategoryModel.find()

    if (categories.length === 0) {
      return res.status(400).json({
        message: "Categories not added. Kindly add Category.",
      });
    }
    return res.status(200).json({
      message: "Categories fetched successfully.",
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Categories due to ${error.message}`,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const existingCategory = await FaqCategoryModel.findById(_id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const deletedCategory = await FaqCategoryModel.findByIdAndDelete(_id);

    let deletedFaqContent;

    try {
      // Try deleting by ObjectId first
      deletedFaqContent = await FaqContentModel.deleteMany({
        faq_category: new mongoose.Types.ObjectId(_id),
      });
    } catch (err) {
      // If some are stored as string, delete by title too
      deletedFaqContent = await FaqContentModel.deleteMany({
        faq_category: existingCategory.title,
      });
    }

    return res.status(200).json({
      message: "Category and its FAQ contents deleted successfully.",
      deletedCategory,
      deletedFaqContent,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      message: `Error deleting category: ${error.message}`,
    });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  getCategory,
  getCategories,
  deleteCategory,
};
