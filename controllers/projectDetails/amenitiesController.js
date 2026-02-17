const path = require("path");
const mongoose = require("mongoose");
const ProjectsModel = require("../../models/projects/projectsModel");
const AmenitiesModel = require("../../models/projectDetails/amenitiesModel");

const createAmenity = async (req, res) => {
  try {
    const { description, alt } = req.body;

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

    const newAmenity = new AmenitiesModel({
      image: imageData ? [imageData] : [],
      alt,
      description,
      project,
    });

    await newAmenity.save();

    return res.status(200).json({
      message: "Added Amenity successfully.",
      newAmenity,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding Amenity due to ${error.message}`,
    });
  }
};

const updateAmenity = async (req, res) => {
  try {
    
    const { alt, description, project } = req.body;
    const AmenityId = req.params._id;

    const file = req.file

    const Amenity = await AmenitiesModel.findById(AmenityId);
    if (!Amenity) return res.status(404).json({ message: "Amenity not found" });
    
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }
      Amenity.image = [
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
        
              Amenity.project = project;
            }

     if (alt !== undefined) Amenity.alt = alt;
    if (description !== undefined) Amenity.description = description;
    await Amenity.save();

    return res.status(200).json({
      message: "Amenity updated successfully.",
      updatedAmenity: Amenity,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating Amenity due to ${error.message}`,
    });
  }
};

const getAmenitiesByProject = async (req, res) => {
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

    const Amenity = await AmenitiesModel.find().populate("project", "title");

    const Amenities = Amenity.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!Amenities || Amenities.length === 0) {
      return res.status(404).json({ message: "No Amenities found for this project" });
    }

    res.status(200).json({
      message: "Amenities fetched for this project successfully",
      Amenities
    });
  } catch (err) {
    console.error("Error fetching Amenities by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAmenity = async (req, res) => {
  try {
    const Amenity = await AmenitiesModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!Amenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }

    return res.status(200).json({
      message: "Amenity fetched successfully.",
      Amenity
    });
    
  } catch (error) {
    console.error("Error fetching Amenity:", error);
    return res.status(500).json({
      message: `Error in fetching Amenity due to ${error.message}`,
    });
  }
};

const getAmenities = async (req, res) => {
  try {
    const Amenities = await AmenitiesModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!Amenities.length) {
      return res.status(400).json({ message: "No Amenities found" });
    }

    return res.status(200).json({
      message: "Amenities fetched successfully.",
      AmenitiesCount: Amenities.length,
      Amenities,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching Amenities: ${error.message}`,
    });
  }
};

const deleteAmenity = async (req, res) => {
  try {
    const AmenityExist = await AmenitiesModel.findById({
      _id: req.params._id,
    });

    if (AmenityExist.length === 0) {
      return res.status(400).json({
        message: "No Amenity is created. Kindly create one.",
      });
    }

    const deletedAmenity = await AmenitiesModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "Amenity deleted successfully.",
      deletedAmenity,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Amenity due to ${error.message}`,
    });
  }
};

module.exports = {
  createAmenity,
  updateAmenity,
  getAmenitiesByProject,
  getAmenity,
  getAmenities,
  deleteAmenity,
};
