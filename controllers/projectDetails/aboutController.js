const AboutModel = require("../../models/projectDetails/aboutModel");
const ProjectModel = require("../../models/projects/projectsModel");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const createAbout = async (req, res) => {
  try {
    const { alt, description, contact  } = req.body;

    const { project } = req.body;
    console.log("project id", project, typeof project);

    const projectExists = await ProjectModel.findById(project);

    if (!projectExists) {
      return res.status(400).json({ message: "project not found" });
    }

    const existingAbout = await AboutModel.findOne({ project });
    if (existingAbout) {
      return res.status(400).json({
        message:
          "About for this project already exists. Please update it instead of adding a new one.",
      });
    }

    let imageData = {};
    let brochureData = {};

    if (req.files && req.files.image && req.files.image[0]) {
      const imageFile = req.files.image[0];
      const extname = path.extname(imageFile.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);

      if (!isImage) {
        return res.status(400).json({ message: "Unsupported image type." });
      }
      if (!alt || alt.trim() === "") {
        return res
          .status(400)
          .json({ message: "Alt text is required for image." });
      }
     
      imageData =  {
                 filename: path.basename(imageFile.key), // "1756968423495-2.jpg"
                 filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageFile.key}` // keep "images/banners/..."
                }
            }
    
    if (req.files && req.files.brochure && req.files.brochure[0]) {
      const brochureFile = req.files.brochure[0];
      const extname = path.extname(brochureFile.originalname).toLowerCase();
      const isPdf = [".pdf"].includes(extname);

      if (!isPdf) {
        return res.status(400).json({ message: "Unsupported brochure type." });
      }

      brochureData =  {
                 filename: path.basename(brochureFile.key), // "1756968423495-2.jpg"
                 filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${brochureFile.key}` // keep "images/banners/..."
                }
    }

    const newAbout = new AboutModel({
      image: imageData ? [imageData] : [],
      alt,
      brochure: brochureData ? [brochureData] : [],
      
      description,
      contact,
      project,
    });

    await newAbout.save();

    res.status(201).json({
      message: "About created successfully",
      About: newAbout,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error creating about: ${error.message}` });
  }
};

const updateAbout = async (req, res) => {
  try {
    const { alt, description, contact, project } = req.body;
    const aboutId = req.params._id;

    const about = await AboutModel.findById(aboutId);
    if (!about) return res.status(404).json({ message: "About not found" });

    // --- Check for duplicate About under same project
    if (project) {
      const duplicate = await AboutModel.findOne({
        project: project,
        _id: { $ne: aboutId },
      }).populate("project", "title");

      if (duplicate) {
        return res.status(400).json({
          message: `About content for project "${duplicate.project.title}" already exists.`,
        });
      }
    }

    // --- Build update object dynamically
    const updateData = {};

    // 🖼️ Image upload
    if (req.files?.image?.[0]) {
      const file = req.files.image[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
        return res.status(400).json({ message: "Unsupported image type." });
      }

      updateData.image = [
        {
          filename: path.basename(file.key),
          filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
        },
      ];
    }

    // 📄 Brochure upload
    if (req.files?.brochure?.[0]) {
      const file = req.files.brochure[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (extname !== ".pdf") {
        return res.status(400).json({ message: "Unsupported brochure type." });
      }

      updateData.brochure = [
        {
          filename: path.basename(file.key),
          filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
        },
      ];
    }

    // 📝 Basic fields
    if (alt !== undefined) updateData.alt = alt;
    if (description !== undefined) updateData.description = description;
    if (contact !== undefined) updateData.contact = contact;

    // 🏗️ Validate project
    if (project) {
      if (!mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const projectExist = await ProjectModel.findById(project);
      if (!projectExist) {
        return res.status(400).json({ message: "Project not found" });
      }

      updateData.project = project;
    }

    // ✅ Apply all updates
    Object.assign(about, updateData);
    await about.save();

    res.status(200).json({
      message: "About updated successfully",
      About: about,
    });
  } catch (error) {
    console.error("Error updating project about:", error);
    res
      .status(500)
      .json({ message: `Error updating project about: ${error.message}` });
  }
};


const getAboutsByProject = async (req, res) => {
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

    const about = await AboutModel.find().populate("project", "title");

    const abouts = about.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!abouts || abouts.length === 0) {
      return res.status(404).json({ message: "No about found for this project" });
    }

    res.status(200).json({
      message: "About fetched for this project successfully",
      about: abouts,
    });
  } catch (err) {
    console.error("Error fetching about by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getAbout = async (req, res) => {
  try {
    const About = await AboutModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!About) {
      return res.status(404).json({ message: "About not found" });
    }

    return res.status(200).json({
      message: "About fetched successfully.",
      about: About,
    });
  } catch (error) {
    console.error("Error fetching about:", error);
    return res.status(500).json({
      message: `Error in fetching about due to ${error.message}`,
    });
  }
};

const getAbouts = async (req, res) => {
  try {
    const Abouts = await AboutModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!Abouts.length) {
      return res.status(400).json({ message: "No Abouts found" });
    }

    return res.status(200).json({
      message: "Abouts fetched successfully.",
      AboutCount: Abouts.length,
      Abouts,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching vinyl Abouts: ${error.message}`,
    });
  }
};

const deleteAbout = async (req, res) => {
  try {
    const AboutExist = await AboutModel.findById({
      _id: req.params._id,
    });

    if (AboutExist.length === 0) {
      return res.status(400).json({
        message: "No about is created. Kindly create one.",
      });
    }

    const deletedAbout = await AboutModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "About deleted successfully.",
      deletedAbout,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting about due to ${error.message}`,
    });
  }
};
module.exports = {
  createAbout,
  updateAbout,
  getAboutsByProject,
  getAbout,
  getAbouts,
  deleteAbout,
};
