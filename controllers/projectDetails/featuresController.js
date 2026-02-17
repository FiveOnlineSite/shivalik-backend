const path = require("path");
const mongoose = require("mongoose");
const ProjectsModel = require("../../models/projects/projectsModel");
const FeaturesModel = require("../../models/projectDetails/featuresModel");

const createFeature = async (req, res) => {
  try {
    const { title, description, alt } = req.body;

    const { project } = req.body;
        console.log("project id", project, typeof project);
    
        const projectExist = await ProjectsModel.findById(project);
    
      let imageData = null;

    if (req.file) {
      const file = req.file;
      const extname = path.extname(file.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);
      if (!isImage)
        return res.status(400).json({ message: "Unsupported image type." });
      if (!alt || !alt.trim())
        return res.status(400).json({ message: "Alt text is required." });

      imageData = {
                              filename: path.basename(file.key), // "1756968423495-2.jpg"
                              filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "images/banners/..."
                             }
    }

    const newFeature = new FeaturesModel({
      image: imageData ? [imageData] : [],
      alt,
      description,
      title,
      project,
    });

    await newFeature.save();

    return res.status(200).json({
      message: "Added feature successfully.",
      newFeature,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding feature due to ${error.message}`,
    });
  }
};

const updateFeature = async (req, res) => {
  try {
    
    const { alt, description, title, project } = req.body;

    const featureId = req.params._id;

    const file = req.file

    const feature = await FeaturesModel.findById(featureId);
    if (!feature) return res.status(404).json({ message: "Feature not found" });
    
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }
      feature.image = [
       {
                               filename: path.basename(file.key), // "1756968423495-2.jpg"
                               filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "images/banners/..."
                              }
      ];
    }

     if (project) {
              if (!mongoose.Types.ObjectId.isValid(project)) {
                return res.status(400).json({ message: "Invalid project ID" });
              }
        
              const projectExist = await ProjectsModel.findById(
                project
              );
              if (!projectExist) {
                return res.status(400).json({ message: "Project not found" });
              }
        
              feature.project = project;
            }

     if (alt !== undefined) feature.alt = alt;
    if (title !== undefined) feature.title = title;
    if (description !== undefined) feature.description = description;
    await feature.save();

    return res.status(200).json({
      message: "Feature updated successfully.",
      updatedFeature: feature,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating feature due to ${error.message}`,
    });
  }
};

const getFeaturesByProject = async (req, res) => {
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

    const feature = await FeaturesModel.find().populate("project", "title");

    const features = feature.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!features || features.length === 0) {
      return res.status(404).json({ message: "No features found for this project" });
    }

    res.status(200).json({
      message: "features fetched for this project successfully",
      features
    });
  } catch (err) {
    console.error("Error fetching features by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getFeature = async (req, res) => {
  try {
    const Feature = await FeaturesModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!Feature) {
      return res.status(404).json({ message: "Feature not found" });
    }

    return res.status(200).json({
      message: "Feature fetched successfully.",
      Feature
    });

  } catch (error) {
    console.error("Error fetching Feature:", error);
    return res.status(500).json({
      message: `Error in fetching Feature due to ${error.message}`,
    });
  }
};

const getFeatures = async (req, res) => {
  try {
    const Features = await FeaturesModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!Features.length) {
      return res.status(400).json({ message: "No Features found" });
    }

    return res.status(200).json({
      message: "Features fetched successfully.",
      FeaturesCount: Features.length,
      Features,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching Features: ${error.message}`,
    });
  }
};

const deleteFeature = async (req, res) => {
  try {
    const FeatureExist = await FeaturesModel.findById({
      _id: req.params._id,
    });

    if (FeatureExist.length === 0) {
      return res.status(400).json({
        message: "No Feature is created. Kindly create one.",
      });
    }

    const deletedFeature = await FeaturesModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "Feature deleted successfully.",
      deletedFeature,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Feature due to ${error.message}`,
    });
  }
};

module.exports = {
  createFeature,
  updateFeature,
  getFeaturesByProject,
  getFeature,
  getFeatures,
  deleteFeature,
};
