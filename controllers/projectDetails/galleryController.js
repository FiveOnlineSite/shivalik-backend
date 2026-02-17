const path = require("path");
const mongoose = require("mongoose");
const ProjectsModel = require("../../models/projects/projectsModel");
const GalleriesModel = require("../../models/projectDetails/galleryModel");

const createGallery = async (req, res) => {
  try {
    const { alt } = req.body;

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

    const newGallery = new GalleriesModel({
      image: imageData ? [imageData] : [],
      alt,
      project,
    });

    await newGallery.save();

    return res.status(200).json({
      message: "Added Gallery successfully.",
      newGallery,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding Gallery due to ${error.message}`,
    });
  }
};

const updateGallery = async (req, res) => {
  try {
    const { alt, project } = req.body;

    const GalleryId = req.params._id;

    const file = req.file

    const Gallery = await GalleriesModel.findById(GalleryId);
    if (!Gallery) return res.status(404).json({ message: "Gallery not found" });
    
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }
      Gallery.image = [
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
        
              Gallery.project = project;
            }

     if (alt !== undefined) Gallery.alt = alt;
    await Gallery.save();

    return res.status(200).json({
      message: "Gallery updated successfully.",
      updatedGallery: Gallery,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating Gallery due to ${error.message}`,
    });
  }
};

const getGalleriesByProject = async (req, res) => {
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

    const Gallery = await GalleriesModel.find().populate("project", "title");

    const Galleries = Gallery.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!Galleries || Galleries.length === 0) {
      return res.status(404).json({ message: "No Galleries found for this project" });
    }

    res.status(200).json({
      message: "Galleries fetched for this project successfully",
      Galleries
    });
  } catch (err) {
    console.error("Error fetching Galleries by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getGallery = async (req, res) => {
  try {
    const Gallery = await GalleriesModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!Gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    return res.status(200).json({
      message: "Gallery fetched successfully.",
      Gallery
    });
    
  } catch (error) {
    console.error("Error fetching Gallery:", error);
    return res.status(500).json({
      message: `Error in fetching Gallery due to ${error.message}`,
    });
  }
};

const getGalleries = async (req, res) => {
  try {
    const Galleries = await GalleriesModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!Galleries.length) {
      return res.status(400).json({ message: "No Galleries found" });
    }

    return res.status(200).json({
      message: "Galleries fetched successfully.",
      GalleriesCount: Galleries.length,
      Galleries,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching Galleries: ${error.message}`,
    });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const GalleryExist = await GalleriesModel.findById({
      _id: req.params._id,
    });

    if (GalleryExist.length === 0) {
      return res.status(400).json({
        message: "No Gallery is created. Kindly create one.",
      });
    }

    const deletedGallery = await GalleriesModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "Gallery deleted successfully.",
      deletedGallery,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Gallery due to ${error.message}`,
    });
  }
};

module.exports = {
  createGallery,
  updateGallery,
  getGalleriesByProject,
  getGallery,
  getGalleries,
  deleteGallery,
};
