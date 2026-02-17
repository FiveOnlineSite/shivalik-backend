const path = require("path");
const mongoose = require("mongoose");
const ProjectsModel = require("../../models/projects/projectsModel");
const DisclaimerModel = require("../../models/projectDetails/disclaimerModel");

const createDisclaimer = async (req, res) => {
  try {
    const { description, alt, registration_no } = req.body;

    const { project } = req.body;
        console.log("project id", project, typeof project);
    
        const projectExist = await ProjectsModel.findById(project);
    

        if (!projectExist) {
              return res.status(400).json({ message: "project not found" });
            }
        
            const existingDisclaimer = await DisclaimerModel.findOne({ project });
            if (existingDisclaimer) {
              return res.status(400).json({
                message:
                  "Disclaimer for this project already exists. Please update it instead of adding a new one.",
              });
            }
        
      let qrData = null;

    if (req.file) {
      const file = req.file;
      const extname = path.extname(file.originalname).toLowerCase();
      const isqr = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);
      if (!isqr)
        return res.status(400).json({ message: "Unsupported qr type." });
      if (!alt || !alt.trim())
        return res.status(400).json({ message: "Alt text is required." });

      qrData = {
                              filename: path.basename(file.key), // "1756968423495-2.jpg"
                              filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "qrs/banners/..."
                             }
    }

    const newDisclaimer = new DisclaimerModel({
      qr: qrData ? [qrData] : [],
      alt,
      description,
      project,
      registration_no,
    });

    await newDisclaimer.save();

    return res.status(200).json({
      message: "Added disclaimer successfully.",
      newDisclaimer,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding disclaimer due to ${error.message}`,
    });
  }
};

const updateDisclaimer = async (req, res) => {
  try {
    
    const { alt, description, project, registration_no } = req.body;
    const disclaimerId = req.params._id;

    const file = req.file

    const disclaimer = await DisclaimerModel.findById(disclaimerId);
    if (!disclaimer) return res.status(404).json({ message: "disclaimer not found" });
    

    if (project) {
          const duplicate = await DisclaimerModel.findOne({
            project: project,   // check same project
            _id: { $ne: disclaimerId } // exclude the current about
          }).populate("project", "title");
    
          if (duplicate) {
            return res.status(400).json({
              message: `Disclaimer content for project "${duplicate.project.title}" already exists.`
            });
          }
        }

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }
      disclaimer.qr = [
       {
                               filename: path.basename(file.key), // "1756968423495-2.jpg"
                               filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "qrs/banners/..."
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
        
              disclaimer.project = project;
            }

     if (alt !== undefined) disclaimer.alt = alt;
    if (description !== undefined) disclaimer.description = description;
     if (registration_no !== undefined) disclaimer.registration_no = registration_no;

    await disclaimer.save();

    return res.status(200).json({
      message: "disclaimer updated successfully.",
      updateddisclaimer: disclaimer,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating disclaimer due to ${error.message}`,
    });
  }
};

const getDisclaimersByProject = async (req, res) => {
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

    const disclaimer = await DisclaimerModel.find().populate("project", "title");

    const disclaimers = disclaimer.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!disclaimers || disclaimers.length === 0) {
      return res.status(404).json({ message: "No disclaimers found for this project" });
    }

    res.status(200).json({
      message: "disclaimers fetched for this project successfully",
      disclaimers
    });
  } catch (err) {
    console.error("Error fetching disclaimers by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getDisclaimer = async (req, res) => {
  try {
    const disclaimer = await DisclaimerModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!disclaimer) {
      return res.status(404).json({ message: "disclaimer not found" });
    }

    return res.status(200).json({
      message: "disclaimer fetched successfully.",
      disclaimer
    });
    
  } catch (error) {
    console.error("Error fetching disclaimer:", error);
    return res.status(500).json({
      message: `Error in fetching disclaimer due to ${error.message}`,
    });
  }
};

const getDisclaimers = async (req, res) => {
  try {
    const disclaimers = await DisclaimerModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!disclaimers.length) {
      return res.status(400).json({ message: "No disclaimers found" });
    }

    return res.status(200).json({
      message: "disclaimers fetched successfully.",
      disclaimersCount: disclaimers.length,
      disclaimers,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching disclaimers: ${error.message}`,
    });
  }
};

const deleteDisclaimer = async (req, res) => {
  try {
    const disclaimerExist = await DisclaimerModel.findById({
      _id: req.params._id,
    });

    if (disclaimerExist.length === 0) {
      return res.status(400).json({
        message: "No disclaimer is created. Kindly create one.",
      });
    }

    const deleteddisclaimer = await DisclaimerModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "disclaimer deleted successfully.",
      deleteddisclaimer,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting disclaimer due to ${error.message}`,
    });
  }
};

module.exports = {
  createDisclaimer,
  updateDisclaimer,
  getDisclaimersByProject,
  getDisclaimer,
  getDisclaimers,
  deleteDisclaimer,
};
