const path = require("path");
const mongoose = require("mongoose");
const ProjectsModel = require("../../models/projects/projectsModel");
const FeaturesContentModel = require("../../models/projectDetails/featuresContentModel");

const createFeaturesContent = async (req, res) => {
  try {
    const { title, alt } = req.body;

    const { project } = req.body;
        console.log("project id", project, typeof project);
    
        const projectExists = await ProjectsModel.findById(project);
    
        if (!projectExists) {
          return res.status(400).json({ message: "project not found" });
        }
        
            const existingFeaturesContent = await FeaturesContentModel.findOne({ project });
            if (existingFeaturesContent) {
              return res.status(400).json({
                message:
                  "Features content for this project already exists. Please update it instead of adding a new one.",
              });
            }

      let imageData = null;

    if (req.file) {
      const file = req.file;
      const extname = path.extname(file.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png", ".svg"].includes(extname);
      if (!isImage)
        return res.status(400).json({ message: "Unsupported image type." });
      if (!alt || !alt.trim())
        return res.status(400).json({ message: "Alt text is required." });

      imageData = {
                              filename: path.basename(file.key), // "1756968423495-2.jpg"
                              filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "images/banners/..."
                             }
    }

    const newFeaturesContent = new FeaturesContentModel({
      image: imageData ? [imageData] : [],
      alt,
      title,
      project,
    });

    await newFeaturesContent.save();

    return res.status(200).json({
      message: "Added features content successfully.",
      newFeaturesContent,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding features content due to ${error.message}`,
    });
  }
};

const updateFeaturesContent = async (req, res) => {
  try {
    const { alt, title, project } = req.body;

    const contentId = req.params._id;

    const file = req.file;

    const content = await FeaturesContentModel.findById(contentId);
    if (!content) return res.status(404).json({ message: "Features content not found" });

    // --- Handle name duplicate check (same as before)
    if (project) {
      const duplicate = await FeaturesContentModel.findOne({
        project: project,   // check same project
        _id: { $ne: contentId } // exclude the current content
      }).populate("project", "title");

      if (duplicate) {
        return res.status(400).json({
          message: `Features content for project "${duplicate.project.title}" already exists.`
        });
      }
    }

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }
      content.image = [
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
    
          content.project = project;
        }
    
     if (alt !== undefined) content.alt = alt;
    if (title !== undefined) content.title = title;
    await content.save();

    return res.status(200).json({
      message: "Features content updated successfully.",
      updatedFeaturesContent: content,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating features content due to ${error.message}`,
    });
  }
};

const getFeatureContentByProject = async (req, res) => {
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

    const content = await FeaturesContentModel.find().populate("project", "title");

    const contents = content.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!contents || contents.length === 0) {
      return res.status(404).json({ message: "No content found for this project" });
    }

    res.status(200).json({
      message: "content fetched for this project successfully",
      content: contents,
    });
  } catch (err) {
    console.error("Error fetching content by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getFeaturesContent = async (req, res) => {
  try {
    const FeaturesContent = await FeaturesContentModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!FeaturesContent) {
      return res.status(404).json({ message: "FeaturesContent not found" });
    }

    return res.status(200).json({
      message: "FeaturesContent fetched successfully.",
      FeaturesContent: FeaturesContent,
    });
  } catch (error) {
    console.error("Error fetching FeaturesContent:", error);
    return res.status(500).json({
      message: `Error in fetching FeaturesContent due to ${error.message}`,
    });
  }
};

const getFeaturesContents = async (req, res) => {
  try {
    const FeaturesContents = await FeaturesContentModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!FeaturesContents.length) {
      return res.status(400).json({ message: "No FeaturesContents found" });
    }

    return res.status(200).json({
      message: "FeaturesContents fetched successfully.",
      FeaturesContentCount: FeaturesContents.length,
      FeaturesContents,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching vinyl FeaturesContents: ${error.message}`,
    });
  }
};

const deleteFeaturesContent = async (req, res) => {
  try {
    const FeaturesContentExist = await FeaturesContentModel.findById({
      _id: req.params._id,
    });

    if (FeaturesContentExist.length === 0) {
      return res.status(400).json({
        message: "No FeaturesContent is created. Kindly create one.",
      });
    }

    const deletedFeaturesContent = await FeaturesContentModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "FeaturesContent deleted successfully.",
      deletedFeaturesContent,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting FeaturesContent due to ${error.message}`,
    });
  }
};

module.exports = {
  createFeaturesContent,
  updateFeaturesContent,
  getFeatureContentByProject,
  getFeaturesContent,
  getFeaturesContents,
  deleteFeaturesContent,
};
