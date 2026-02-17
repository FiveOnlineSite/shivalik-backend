const FaqCategoryModel = require("../../models/faq/faqCategoryModel");
const FaqContentModel = require("../../models/faq/faqContentModel")
const mongoose = require("mongoose")

const createContent = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const { faq_category } = req.body;
    console.log("faq_category id", faq_category, typeof faq_category);

    const faqCategoryExists = await FaqCategoryModel.findById(
      faq_category
    );

    if (!faqCategoryExists) {
      return res.status(400).json({ message: "Faq category not found" });
    }

    const newContent = new FaqContentModel({
      question,
      answer,
      faq_category
    });

    await newContent.save();

    return res.status(200).json({
      message: "Content added successfully.",
      newContent,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding Content due to ${error.message}`,
    });
  }
};

const updateContent = async (req, res) => {
  try {
    const { _id } = req.params;
    const { question, answer, faq_category} = req.body;

    const currentContent = await FaqContentModel.findById(_id);
    if (!currentContent) {
      return res
        .status(404)
        .json({ message: "Content not found." });
    }

     if (faq_category) {
      if (!mongoose.Types.ObjectId.isValid(faq_category)) {
        return res.status(400).json({ message: "Invalid faq_category ID" });
      }

      const faqCategoryExists = await FaqCategoryModel.findById(
        faq_category
      );
      if (!faqCategoryExists) {
        return res.status(400).json({ message: "faq category not found" });
      }
    }

    const updatedFields = { question, answer, faq_category };

    const updatedContent =
      await FaqContentModel.findByIdAndUpdate(_id, updatedFields, {
        new: true,
      });

    return res.status(200).json({
      message: "Content updated successfully.",
      updatedContent,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating Content due to ${error.message}`,
    });
  }
};

const getContentByCategory = async (req, res) => {
  try {

    const {category} = req.params;

    const Content = await FaqContentModel.find(
      category
    );

    if (!Content) {
      return res.status(400).json({
        message: "No Content is created for this category. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "Content fetched for this category successfully.",
      Content,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Content of this category due to ${error.message}`,
    });
  }
};

const getContent = async (req, res) => {
  try {
    const Content = await FaqContentModel.findById(
      req.params._id
    );

    if (!Content) {
      return res.status(400).json({
        message: "No Content is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "Content fetched successfully.",
      Content,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Content due to ${error.message}`,
    });
  }
};

const getContents = async (req, res) => {
  try {
    const Contents = await FaqContentModel.find().populate("faq_category", "title")

    if (Contents.length === 0) {
      return res.status(400).json({
        message: "Contents not added. Kindly add Content.",
      });
    }
    return res.status(200).json({
      message: "Contents fetched successfully.",
      count: Contents.length,
      Contents,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Contents due to ${error.message}`,
    });
  }
};

const deleteContent = async (req, res) => {
  try {

    const { _id } = req.params; 
    const Contents = await FaqContentModel.findById(_id);

    if (!Contents) {
      return res.status(400).json({
        message: "No Content added to delete. Kindly add one.",
      });
    }

    const deletedContent =
      await FaqContentModel.findByIdAndDelete(
        _id
      );

    return res.status(200).json({
      message: "Content deleted successfully.",
      deletedContent,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Content due to ${error.message}`,
    });
  }
};

module.exports = {
  createContent,
  updateContent,
  getContentByCategory,
  getContent,
  getContents,
  deleteContent,
};
