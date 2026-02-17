const ProjectsModel = require("../../models/projects/projectsModel")
const path = require("path")
const AboutModel = require("../../models/projectDetails/aboutModel")
const AmenitiesModel = require("../../models/projectDetails/amenitiesModel")
const BanksModel = require("../../models/projectDetails/banksModel")
const CurrentStatusModel = require("../../models/projectDetails/currentStatusModel")
const DisclaimerModel = require("../../models/projectDetails/disclaimerModel")
const FAQModel = require("../../models/projectDetails/faqModel")
const FeaturesContentModel = require("../../models/projectDetails/featuresContentModel")
const FeaturesModel = require("../../models/projectDetails/featuresModel")
const GalleryModel = require("../../models/projectDetails/galleryModel")
const HighlightsModel = require("../../models/projectDetails/highlightsModel")
const LocationModel = require("../../models/projectDetails/locationModel")
const SitePlanModel = require("../../models/projectDetails/sitePlanModel")
const mongoose = require("mongoose")

const slugify = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")        // replace &
    .replace(/\//g, "-")  
    .replace(/['’]/g, "")       // replace /
    .replace(/[^a-z0-9]+/g, "-") // other chars → -
    .replace(/^-+|-+$/g, "");
    

const createProject = async (req, res) => {
  try {
    const {
      project_category,
      title,
      location,
      excerpt,
      completion_date,
      alt,
      banner_alt,
      mobile_banner_alt,
      metaTitle,
      disclaimer,
      metaDescription,
      metaKeyword
    } = req.body;

    // Validate category
    if (!["Shivalik", "Promoters"].includes(project_category)) {
      return res.status(400).json({
        message: "Give 'shivalik' or 'promoters' as category",
      });
    }

    let mainImage = [];
    let banner = [];
    let mobileBanner = [];

    // handle main image (single)
    if (req.files?.image && req.files.image[0]) {
      const file = req.files.image[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
        return res.status(400).json({ message: "Unsupported image type for main image." });
      }
      if (!alt || !alt.trim()) {
        return res.status(400).json({ message: "Alt text is required for main image." });
      }

      mainImage.push({
        filename: path.basename(file.key),
        filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
      });
    }

    // handle banner (optional)
    if (req.files?.banner && req.files.banner[0]) {
      const file = req.files.banner[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
        return res.status(400).json({ message: "Unsupported image type for banner." });
      }

      banner.push({
        filename: path.basename(file.key),
        filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
      });
    }

    // handle mobile banner (optional)
    if (req.files?.mobile_banner && req.files.mobile_banner[0]) {
      const file = req.files.mobile_banner[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
        return res.status(400).json({ message: "Unsupported image type for mobile banner." });
      }

      mobileBanner.push({
        filename: path.basename(file.key),
        filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
      });
    }

    if (banner.length && !mobileBanner.length) {
  return res
    .status(400)
    .json({ message: "If you upload a banner, you must also upload a mobile banner." });
    }

    const lastItem = await ProjectsModel
          .findOne({ project_category })
          .sort({ sequence: -1 });
    
        const newSeq = lastItem ? lastItem.sequence + 1 : 1;
    

    // Create project
    const newProject = new ProjectsModel({
      project_category,
      title,
      location,
      excerpt,
      completion_date,
      image: mainImage,
      alt,
      banner: banner.length ? banner : undefined,
      banner_alt: banner_alt || undefined,
      mobile_banner: mobileBanner.length ? mobileBanner : undefined,
      mobile_banner_alt: mobile_banner_alt || undefined,
      sequence: newSeq,
      metaTitle,
      metaDescription,
      metaKeyword,
      disclaimer
    });

    await newProject.save();

    return res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error creating project: ${error.message}`,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { _id } = req.params;
    const {
      title,
      location,
      completion_date,
      excerpt,
      alt,
      banner_alt,
      mobile_banner_alt,
      sequence,
      project_category,
      metaTitle,
      metaDescription,
      metaKeyword,
      removeBanner,
      removeMobileBanner,
      disclaimer
    } = req.body;

    const project = await ProjectsModel.findById(_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // --- Update text/meta fields safely ---
    const textFields = {
      title,
      location,
      completion_date,
      excerpt,
      alt,
      banner_alt,
      mobile_banner_alt,
      project_category,
      metaTitle,
      metaDescription,
      metaKeyword,
      disclaimer,
    };

    for (const [key, value] of Object.entries(textFields)) {
      if (value !== undefined) project[key] = value; // allow empty string
    }

    // --- Handle main image upload ---
    if (req.files?.image?.[0]) {
      project.image = [
        {
          filename: req.files.image[0].filename,
          filepath: req.files.image[0].location || req.files.image[0].path,
        },
      ];
    }

    // --- Handle banner upload or removal ---
    if (req.files?.banner?.[0]) {
      project.banner = [
        {
          filename: req.files.banner[0].filename,
          filepath: req.files.banner[0].location || req.files.banner[0].path,
        },
      ];
    } else if (removeBanner === "true") {
      project.banner = [];
      project.banner_alt = "";
    }

    // --- Handle mobile banner upload or removal ---
    if (req.files?.mobile_banner?.[0]) {
      project.mobile_banner = [
        {
          filename: req.files.mobile_banner[0].filename,
          filepath: req.files.mobile_banner[0].location || req.files.mobile_banner[0].path,
        },
      ];
    } else if (removeMobileBanner === "true") {
      project.mobile_banner = [];
      project.mobile_banner_alt = "";
    }

    // --- Handle sequence updates ---
    const oldSeq = project.sequence;
    const newSeq = sequence !== undefined && sequence !== "" ? parseInt(sequence, 10) : oldSeq;
    const category = project_category || project.project_category;

    if (isNaN(newSeq) || newSeq < 1) {
      return res.status(400).json({ message: "Sequence must be a positive number." });
    }

    if (newSeq !== oldSeq || category !== project.project_category) {
      if (category === project.project_category) {
        if (newSeq < oldSeq) {
          // Shift down
          await ProjectsModel.updateMany(
            { project_category: category, sequence: { $gte: newSeq, $lt: oldSeq } },
            { $inc: { sequence: 1 } }
          );
        } else if (newSeq > oldSeq) {
          // Shift up
          await ProjectsModel.updateMany(
            { project_category: category, sequence: { $gt: oldSeq, $lte: newSeq } },
            { $inc: { sequence: -1 } }
          );
        }
      } else {
        // Moving to a different category
        await ProjectsModel.updateMany(
          { project_category: project.project_category, sequence: { $gt: oldSeq } },
          { $inc: { sequence: -1 } }
        );

        const count = await ProjectsModel.countDocuments({ project_category: category });
        project.sequence = count + 1;
      }

      project.sequence = newSeq;
      project.project_category = category;
    }

    // --- Save project ---
    await project.save();

    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      message: "Failed to update project",
      error: error.message,
    });
  }
};

const getProjectWithBanners = async (req, res) => {
  try {
    const projects = await ProjectsModel.find(
      { banner: { $exists: true, $ne: null } }, // only projects with banner
      "title banner" // return only required fields
    );

    res.status(200).json({ Projects: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

const getBannersByProject = async (req, res) => {
  try {
    const paramSlug = slugify(req.params.name || "");

    const banners = await ProjectsModel.find();

    console.log("paramSlug:", paramSlug);

    banners.forEach((b) =>
      console.log("db title:", JSON.stringify(b.title), "=>", slugify(b.title))
    );

    const matchedbanner = banners.find(
      (b) => slugify(b.title) === paramSlug
    );

    console.log("paramSlug1:", paramSlug);

    if (!matchedbanner) {
      return res.status(404).json({ message: "banner not found" });
    }

    res.status(200).json({
      message: "banner fetched successfully",
      banner: matchedbanner,
    });
  } catch (err) {
    console.error("Error fetching banner by title:", err.message);
    res.status(500).json({ message: `Server error ${err.message}` });
  }
};


const getProject = async (req, res) => {
  try {
    const Project = await ProjectsModel.findById(req.params._id);

    if (!Project) {
      return res.status(400).json({
        message: "No Project is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "Project fetched successfully.",
      Project,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Project due to ${error.message}`,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const Projects = await ProjectsModel
      .find()
      .sort({ project_category: 1, sequence: 1 });

    if (Projects.length === 0) {
      return res.status(400).json({
        message: "No Projects are created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "All Projects fetched successfully.",
      count: Projects.length,
      Projects,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Projects due to ${error.message}`,
    });
  }
};

const deleteProject = async (req, res) => {
  try {

     const { _id } = req.params;
    const objectId = new mongoose.Types.ObjectId(_id);

    const ProjectExists = await ProjectsModel.findById(objectId);
    if (!ProjectExists) {
      return res.status(400).json({
        message: "No project found to delete. Kindly create one.",
      });
    }

const deletedProject = await ProjectsModel.findByIdAndDelete(objectId);
    if (!deletedProject) {
      return res.status(400).json({ message: "Project not found or already deleted." });
    }

    // const deletedAbout = await AboutModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedAmenities = await AmenitiesModel.deleteMany({
    //   project: objectId,
    // });

    //  const deletedBanks = await BanksModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedCurrentStatus = await CurrentStatusModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedDisclaimer = await DisclaimerModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedFAQ = await FAQModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedFeaturesContent = await FeaturesContentModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedFeatures = await FeaturesModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedGallery = await GalleryModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedHighlights = await HighlightsModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedLocation = await LocationModel.deleteMany({
    //   project: objectId,
    // });

    // const deletedSitePlan = await SitePlanModel.deleteMany({
    //   project: objectId,
    // });

    await ProjectsModel.updateMany(
      { sequence: { $gt: deletedProject.sequence } },
      { $inc: { sequence: -1 } }
    );

    const updatedList = await ProjectsModel.find().sort({ sequence: 1 }).lean();

    return res.status(200).json({
      message: "Project deleted successfully.",
      deletedProject,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Project due to ${error.message}`,
    });
  }
};


module.exports = {
  createProject,
  updateProject,
  getProjectWithBanners,
  getBannersByProject,
  getProject,
  getProjects,
  deleteProject
}

