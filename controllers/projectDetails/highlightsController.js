const path = require("path");
const mongoose = require("mongoose");
const ProjectsModel = require("../../models/projects/projectsModel");
const HighlightsModel = require("../../models/projectDetails/highlightsModel");

const createHighlight = async (req, res) => {
  try {
    const { title, alt } = req.body;

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

    const newHighlight = new HighlightsModel({
      image: imageData ? [imageData] : [],
      alt,
      title,
      project,
    });

    await newHighlight.save();

    return res.status(200).json({
      message: "Added Highlight successfully.",
      newHighlight,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding Highlight due to ${error.message}`,
    });
  }
};

const updateHighlight = async (req, res) => {
  try {
    const { alt, title, project } = req.body;

    const HighlightId = req.params._id;

    const file = req.file

    const Highlight = await HighlightsModel.findById(HighlightId);
    if (!Highlight) return res.status(404).json({ message: "Highlight not found" });
    
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }
      Highlight.image = [
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
        
              Highlight.project = project;
            }

     if (alt !== undefined) Highlight.alt = alt;
    if (title !== undefined) Highlight.title = title;
    await Highlight.save();

    return res.status(200).json({
      message: "Highlight updated successfully.",
      updatedHighlight: Highlight,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating Highlight due to ${error.message}`,
    });
  }
};

const getHighlightsByProject = async (req, res) => {
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

    const Highlight = await HighlightsModel.find().populate("project", "title");

    const Highlights = Highlight.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!Highlights || Highlights.length === 0) {
      return res.status(404).json({ message: "No Highlights found for this project" });
    }

    res.status(200).json({
      message: "Highlights fetched for this project successfully",
      Highlights
    });
  } catch (err) {
    console.error("Error fetching Highlights by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getHighlight = async (req, res) => {
  try {
    const Highlight = await HighlightsModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!Highlight) {
      return res.status(404).json({ message: "Highlight not found" });
    }

    return res.status(200).json({
      message: "Highlight fetched successfully.",
      Highlight
    });
    
  } catch (error) {
    console.error("Error fetching Highlight:", error);
    return res.status(500).json({
      message: `Error in fetching Highlight due to ${error.message}`,
    });
  }
};

const getHighlights = async (req, res) => {
  try {
    const Highlights = await HighlightsModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!Highlights.length) {
      return res.status(400).json({ message: "No Highlights found" });
    }

    return res.status(200).json({
      message: "Highlights fetched successfully.",
      HighlightsCount: Highlights.length,
      Highlights,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching Highlights: ${error.message}`,
    });
  }
};

const deleteHighlight = async (req, res) => {
  try {
    const HighlightExist = await HighlightsModel.findById({
      _id: req.params._id,
    });

    if (HighlightExist.length === 0) {
      return res.status(400).json({
        message: "No Highlight is created. Kindly create one.",
      });
    }

    const deletedHighlight = await HighlightsModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "Highlight deleted successfully.",
      deletedHighlight,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Highlight due to ${error.message}`,
    });
  }
};

module.exports = {
  createHighlight,
  updateHighlight,
  getHighlightsByProject,
  getHighlight,
  getHighlights,
  deleteHighlight,
};
