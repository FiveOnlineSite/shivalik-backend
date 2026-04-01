const path = require("path");
const mongoose = require("mongoose");
const ProjectsModel = require("../../models/projects/projectsModel");
const BanksModel = require("../../models/projectDetails/banksModel");

const createBank = async (req, res) => {
  try {
    const { alt, title } = req.body;

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

    const newBank = new BanksModel({
      image: imageData ? [imageData] : [],
      alt,
      project,
      title
    });

    await newBank.save();

    return res.status(200).json({
      message: "Added Bank successfully.",
      newBank,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding Bank due to ${error.message}`,
    });
  }
};

const updateBank = async (req, res) => {
  try {
    const { alt, project, title } = req.body;

    const BankId = req.params._id;

    const file = req.file

    const Bank = await BanksModel.findById(BankId);
    if (!Bank) return res.status(404).json({ message: "Bank not found" });
    
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }
      Bank.image = [
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
        
              Bank.project = project;
            }

     if (alt !== undefined) Bank.alt = alt;
     if (title !== undefined) Bank.title = title;

    await Bank.save();

    return res.status(200).json({
      message: "Bank updated successfully.",
      updatedBank: Bank,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating Bank due to ${error.message}`,
    });
  }
};

const getBanksByProject = async (req, res) => {
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

    const Bank = await BanksModel.find().populate("project", "title");

    const Banks = Bank.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!Banks || Banks.length === 0) {
      return res.status(404).json({ message: "No Banks found for this project" });
    }

    res.status(200).json({
      message: "Banks fetched for this project successfully",
      Banks
    });
  } catch (err) {
    console.error("Error fetching Banks by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getBank = async (req, res) => {
  try {
    const Bank = await BanksModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!Bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    return res.status(200).json({
      message: "Bank fetched successfully.",
      Bank
    });
    
  } catch (error) {
    console.error("Error fetching Bank:", error);
    return res.status(500).json({
      message: `Error in fetching Bank due to ${error.message}`,
    });
  }
};

const getBanks = async (req, res) => {
  try {
    const Banks = await BanksModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!Banks.length) {
      return res.status(400).json({ message: "No Banks found" });
    }

    return res.status(200).json({
      message: "Banks fetched successfully.",
      BanksCount: Banks.length,
      Banks,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching Banks: ${error.message}`,
    });
  }
};

const deleteBank = async (req, res) => {
  try {
    const BankExist = await BanksModel.findById({
      _id: req.params._id,
    });

    if (BankExist.length === 0) {
      return res.status(400).json({
        message: "No Bank is created. Kindly create one.",
      });
    }

    const deletedBank = await BanksModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "Bank deleted successfully.",
      deletedBank,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Bank due to ${error.message}`,
    });
  }
};

module.exports = {
  createBank,
  updateBank,
  getBanksByProject,
  getBank,
  getBanks,
  deleteBank,
};
