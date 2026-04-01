const SitePlanModel = require("../../models/projectDetails/sitePlanModel");
const ProjectModel = require("../../models/projects/projectsModel");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const createSitePlan = async (req, res) => {
  try {
    const { site_plan, floor_plan_alt, unit_plan_alt} = req.body;

    const { project } = req.body;
    console.log("project id", project, typeof project);

    const projectExists = await ProjectModel.findById(project);

    if (!projectExists) {
      return res.status(400).json({ message: "project not found" });
    }

    // if (!["1 BHK", "2 BHK"].includes(site_plan)) {
    //   return res.status(400).json({ message: "Site plan must be '1 BHK' or '2 BHK'" });
    // }

    const sitePlan = await SitePlanModel.findOne({ project, site_plan });
    if (sitePlan) {
      return res.status(400).json({
        message:
          `Site plan ${site_plan} of this project already exists. Please update it instead of adding a new one.`,
      });
    }

    let floorPlanData = {};
    let unitPlanData = {};

    if (req.files && req.files.floor_plan && req.files.floor_plan[0]) {
      const floorPlanFile = req.files.floor_plan[0];
      const extname = path.extname(floorPlanFile.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);

      if (!isImage) {
        return res.status(400).json({ message: "Unsupported image type." });
      }
      if (!floor_plan_alt || floor_plan_alt.trim() === "") {
        return res
          .status(400)
          .json({ message: "Alt text is required for floor plan." });
      }
     
      floorPlanData =  {
                 filename: path.basename(floorPlanFile.key), // "1756968423495-2.jpg"
                 filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${floorPlanFile.key}` // keep "floor_plans/banners/..."
                }
            }
    
    if (req.files && req.files.unit_plan && req.files.unit_plan[0]) {
      const unitPlanFile = req.files.unit_plan[0];
      const extname = path.extname(unitPlanFile.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);

      if (!isImage) {
        return res.status(400).json({ message: "Unsupported image type." });
      }

      if (!unit_plan_alt || unit_plan_alt.trim() === "") {
        return res
          .status(400)
          .json({ message: "Alt text is required for unit plan." });
      }

      unitPlanData =  {
                 filename: path.basename(unitPlanFile.key), // "1756968423495-2.jpg"
                 filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${unitPlanFile.key}` // keep "floor_plans/banners/..."
                }
    }

    const newSitePlan = new SitePlanModel({
      floor_plan: floorPlanData ? [floorPlanData] : [],
      unit_plan: unitPlanData ? [unitPlanData] : [],
      site_plan,
      floor_plan_alt,
      unit_plan_alt,
      project,
    });

    await newSitePlan.save();

    res.status(201).json({
      message: "Site Plan created successfully",
      newSitePlan,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error creating Site Plan: ${error.message}` });
  }
};

const updateSitePlan = async (req, res) => {
  try {
    const { site_plan, floor_plan_alt, unit_plan_alt, project } = req.body;
    const _id = req.params._id;

    const existingSitePlan = await SitePlanModel.findById(_id);
    if (!existingSitePlan) return res.status(404).json({ message: "existingSitePlan not found" });

    // const sitePlan = site_plan || existingSitePlan.site_plan;
    // if (!["1 BHK", "2 BHK"].includes(sitePlan)) {
    //   return res.status(400).json({ message: "Invalid site plan. Use '1 BHK' or '2 BHK'." });
    // }

    if (project) {
      const duplicate = await SitePlanModel.findOne({
        project: project,   // check same project
        _id: { $ne: _id }, // exclude the current existingSitePlan
        site_plan
      }).populate("project", "title");

      if (duplicate) {
        return res.status(400).json({
          message: `Site Plan for project "${duplicate.project.title}" already exists.`
        });
      }
    }

    let updateData = {};

    if (req.files?.floor_plan?.[0]) {
      const file = req.files.floor_plan[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
        return res.status(400).json({ message: "Unsupported floor_plan type." });
      }

      updateData.floor_plan = [
        {
                         filename: path.basename(file.key), // "1756968423495-2.jpg"
                         filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "floor_plans/banners/..."
                        }
      ];
    }

    if (req.files?.unit_plan?.[0]) {
      const file = req.files.unit_plan[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
        return res.status(400).json({ message: "Unsupported floor_plan type." });
      }

      updateData.unit_plan = [
        {
                         filename: path.basename(file.key), // "1756968423495-2.jpg"
                         filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "floor_plans/banners/..."
                        }
      ];
    }

    // existingSitePlan.site_plan = sitePlan;
    if (site_plan !== undefined) existingSitePlan.site_plan = site_plan;

    if (floor_plan_alt !== undefined) existingSitePlan.floor_plan_alt = floor_plan_alt;
   if (unit_plan_alt !== undefined) existingSitePlan.unit_plan_alt = unit_plan_alt;
    if (updateData.floor_plan) {
  existingSitePlan.floor_plan = updateData.floor_plan;
}

if (updateData.unit_plan) {
  existingSitePlan.unit_plan = updateData.unit_plan;
}
    if (project) {
      if (!mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const projectExist = await ProjectModel.findById(
        project
      );
      if (!projectExist) {
        return res.status(400).json({ message: "Project not found" });
      }

      existingSitePlan.project = project;
    }

    await existingSitePlan.save();

    res.status(200).json({
      message: "Site Plan updated successfully",
      updatedSitePlan: existingSitePlan,
    });
  } catch (error) {
    res.status(500).json({ message: `Error updating Site Plan: ${error.message}` });
  }
};

const getSitePlansByProject = async (req, res) => {
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

    const existingSitePlan = await SitePlanModel.find().populate("project", "title");

    const existingSitePlans = existingSitePlan.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!existingSitePlans || existingSitePlans.length === 0) {
      return res.status(404).json({ message: "No SitePlan found for this project" });
    }

    res.status(200).json({
      message: " SitePlan fetched for this project successfully",
      SitePlan: existingSitePlans,
    });
  } catch (err) {
    console.error("Error fetching SitePlan by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getSitePlan = async (req, res) => {
  try {
    const SitePlan = await SitePlanModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

    if (!SitePlan) {
      return res.status(404).json({ message: "Site Plan not found" });
    }

    return res.status(200).json({
      message: "Site Plan fetched successfully.",
      SitePlan,
    });
  } catch (error) {
    console.error("Error fetching Site Plan:", error);
    return res.status(500).json({
      message: `Error in fetching Site Plan due to ${error.message}`,
    });
  }
};

const getSitePlans = async (req, res) => {
  try {
    const SitePlans = await SitePlanModel.find()
      .populate("project") // <-- populate the project field
      .lean();

    if (!SitePlans.length) {
      return res.status(400).json({ message: "No Site Plans found" });
    }

    return res.status(200).json({
      message: "Site Plans fetched successfully.",
      SitePlansCount: SitePlans.length,
      SitePlans,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching Site Plans: ${error.message}`,
    });
  }
};

const deleteSitePlan = async (req, res) => {
  try {
    const SitePlanExist = await SitePlanModel.findById({
      _id: req.params._id,
    });

    if (SitePlanExist.length === 0) {
      return res.status(400).json({
        message: "No SitePlan is created. Kindly create one.",
      });
    }

    const deletedSitePlan = await SitePlanModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "SitePlan deleted successfully.",
      deletedSitePlan,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting SitePlan due to ${error.message}`,
    });
  }
};

module.exports = {
  createSitePlan,
  updateSitePlan,
  getSitePlansByProject,
  getSitePlan,
  getSitePlans,
  deleteSitePlan,
};
