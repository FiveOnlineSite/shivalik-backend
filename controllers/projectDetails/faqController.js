const ProjectsModel = require("../../models/projects/projectsModel");
const FAQModel = require("../../models/projectDetails/faqModel")
const mongoose = require("mongoose")

const createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const { project } = req.body;
    console.log("project id", project, typeof project);

    const projectExist = await ProjectsModel.findById(
      project
    );

    if (!projectExist) {
      return res.status(400).json({ message: "Faq category not found" });
    }

    const newFAQ = new FAQModel({
      question,
      answer,
      project
    });

    await newFAQ.save();

    return res.status(200).json({
      message: "FAQ added successfully.",
      newFAQ,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding FAQ due to ${error.message}`,
    });
  }
};

const updateFAQ = async (req, res) => {
  try {
    const { _id } = req.params;
    const { question, answer, project} = req.body;

    const currentFAQ = await FAQModel.findById(_id);
    if (!currentFAQ) {
      return res
        .status(404)
        .json({ message: "FAQ not found." });
    }

     if (project) {
      if (!mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const projectExist = await ProjectsModel.findById(
        project
      );
      if (!projectExist) {
        return res.status(400).json({ message: "faq category not found" });
      }
    }

    const updatedFields = { question, answer, project };

    const updatedFAQ =
      await FAQModel.findByIdAndUpdate(_id, updatedFields, {
        new: true,
      });

    return res.status(200).json({
      message: "FAQ updated successfully.",
      updatedFAQ,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating FAQ due to ${error.message}`,
    });
  }
};

const getFAQByProject = async (req, res) => {
  try {
    let name = req.params.name || "";

    const normalize = (str) =>
      str?.toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/['’]/g, "")  
        .replace(/\//g, "-")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const FAQ = await FAQModel.find().populate("project", "title");

    const FAQs = FAQ.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!FAQs || FAQs.length === 0) {
      return res.status(404).json({ message: "No FAQs found for this project" });
    }

    res.status(200).json({
      message: "FAQs fetched for this project successfully",
      FAQs
    });
  } catch (err) {
    console.error("Error fetching FAQs by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getFAQ = async (req, res) => {
  try {
    const FAQ = await FAQModel.findById(
      req.params._id
    );

    if (!FAQ) {
      return res.status(400).json({
        message: "No FAQ is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "FAQ fetched successfully.",
      FAQ,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching FAQ due to ${error.message}`,
    });
  }
};

const getFAQs = async (req, res) => {
  try {
    const FAQs = await FAQModel.find().populate("project", "title")

    if (FAQs.length === 0) {
      return res.status(400).json({
        message: "FAQs not added. Kindly add FAQ.",
      });
    }
    return res.status(200).json({
      message: "FAQs fetched successfully.",
      count: FAQs.length,
      FAQs,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching FAQs due to ${error.message}`,
    });
  }
};

const deleteFAQ = async (req, res) => {
  try {
    const FAQs = await FAQModel.findById({
      _id: req.params._id,
    });

    if (FAQs.length === 0) {
      return res.status(400).json({
        message: "No FAQ added to delete. Kindly add one.",
      });
    }

    const deletedFAQ =
      await FAQModel.findOneAndDelete({
      _id: req.params._id,
    })

    return res.status(200).json({
      message: "FAQ deleted successfully.",
      deletedFAQ,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting FAQ due to ${error.message}`,
    });
  }
};

module.exports = {
  createFAQ,
  updateFAQ,
  getFAQByProject,
  getFAQ,
  getFAQs,
  deleteFAQ,
};
