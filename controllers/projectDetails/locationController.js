const LocationModel = require("../../models/projectDetails/locationModel");
const ProjectsModel = require("../../models/projects/projectsModel")
const mongoose = require("mongoose");
const path = require("path");

const createLocation = async (req, res) => {
  try {
    const { map_link, project, location } = req.body;

    console.log("project id", project, typeof project);

    const projectExists = await ProjectsModel.findById(project);
    if (!projectExists) {
      return res.status(400).json({ message: "project not found" });
    }

    const existingLocation = await LocationModel.findOne({ project });
    if (existingLocation) {
      return res.status(400).json({
        message:
          "Location for this project already exists. Please update it instead of adding a new one.",
      });
    }

    // use `location` array directly instead of parsing
    const uploadedInfo = (location || []).map((info) => ({
      place: info.place,
      distance: info.distance,
    }));

    const newLocation = new LocationModel({
      project,
      map_link,
      location: uploadedInfo, // ✅ match schema field
    });

    await newLocation.save();

    res.status(201).json({
      message: "Location added successfully",
      newLocation,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error in adding Location: ${error.message}`,
    });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { project, map_link } = req.body;
    const LocationId = req.params._id;

    const existingLocation = await LocationModel.findById(LocationId);
    if (!existingLocation) return res.status(404).json({ message: "Location not found" });

    if (project) {
          const duplicate = await LocationModel.findOne({
            project: project,   // check same project
            _id: { $ne: LocationId } // exclude the current about
          }).populate("project", "title");
    
          if (duplicate) {
            return res.status(400).json({
              message: `Location for project "${duplicate.project.title}" already exists.`
            });
          }
        }
    let infoData = [];
    if (req.body.info) {
    if (typeof req.body.info === "string") {
        try {
        infoData = JSON.parse(req.body.info);
        } catch (err) {
        return res.status(400).json({ message: "Invalid info payload (not JSON)." });
        }
    } else if (Array.isArray(req.body.info)) {
        infoData = req.body.info;
    } else {
        return res.status(400).json({ message: "Invalid info payload." });
    }
    }

    const uploadedInfo = []; // new location to append
    const modifiedInfo = []; 
    
    for (let i = 0; i < infoData.length; i++) {
      const info = infoData[i];

       if (info._id) {
        const existingIndex = existingLocation.info.findIndex(
          (sm) => sm._id && sm._id.toString() === info._id
        );

        if (existingIndex !== -1) {
          // convert mongoose subdoc to plain object safely if needed
          const existingItem = existingLocation.info[existingIndex];
          const existingObj = existingItem.toObject ? existingItem.toObject() : existingItem;

          const updatedItem = {
            ...existingObj,
            place: info.place !== undefined ? info.place : existingObj.place,
            distance: info.distance !== undefined ? info.distance : existingObj.distance,

          };

          // update the in-memory existingLocation object so final location list contains latest
          existingLocation.info[existingIndex] = updatedItem;
          modifiedInfo.push(updatedItem);
        }
      } else {
        // new Location entry — attach whatever infoData we have (could be null if frontend mis-sent)
        uploadedInfo.push({
          place: info.place || "",
          distance: info.distance || "",

        });
      }
    }

    // if project is provided, validate it
    if (project) {
      if (!mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const projectExist = await ProjectsModel.findById(project);
      if (!projectExist) {
        return res.status(400).json({ message: "Project not found" });
      }
    }

    // compute final location list: use the existingLocation.location (which we mutated above) plus newly uploaded ones
    const finalInfo = Array.isArray(existingLocation.info)
      ? existingLocation.info.concat(uploadedInfo)
      : uploadedInfo;

    // prepare updated fields (fall back to existing values if fields are not provided)
    const updatedFields = {
      project: project || existingLocation.project,
      map_link: map_link || existingLocation.map_link,
      info: finalInfo,
    };

    const updatedInfo = await LocationModel.findByIdAndUpdate(LocationId, updatedFields, { new: true });

    return res.status(200).json({
      message: "Location updated successfully.",
      modifiedInfo,
      updatedInfo,
    });
  } catch (error) {
    console.error("updateLocation error:", error);
    return res.status(500).json({
      message: `Error in updating Location: ${error.message || error}`,
    });
  }
};

const getLocationsByProject = async (req, res) => {
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

    const Location = await LocationModel.find().populate("project", "title");

    const Locations = Location.filter(
      (a) => normalize(a.project?.title) === normalize(name)
    );

    if (!Locations || Locations.length === 0) {
      return res.status(404).json({ message: "No Location found for this project" });
    }

    res.status(200).json({
      message: "Location fetched for this project successfully",
      Location: Locations,
    });
  } catch (err) {
    console.error("Error fetching Location by project title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getLocationInfo = async (req, res) => {
  try {
    const { infoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(infoId)) {
      return res.status(400).json({ message: "Invalid infoId" });
    }

    const info = await LocationModel.findOne({
      "info._id": new mongoose.Types.ObjectId(infoId),
    });

    if (!info) {
      return res.status(404).json({
        message: "info not found in any Location document.",
      });
    }

    const matchedInfo = info.info.find((s) => s._id.toString() === infoId);

    if (!matchedInfo) {
      return res.status(404).json({ message: "info not found in array." });
    }

    return res.status(200).json({
      message: "info fetched successfully.",
      info: matchedInfo,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching info due to ${error.message}`,
    });
  }
};

const getLocation = async (req, res) => {
  try {
    const Location = await LocationModel.findById(req.params._id)
      .populate("project", "title")
      .lean();

        if (!Location) {
        return res.status(404).json({ message: "Location not found" });
        }

    return res.status(200).json({
      message: "Locations fetched successfully.",
      Location,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Locations due to ${error.message}`,
    });
  }
};

const getLocations = async (req, res) => {
  try {
    const Locations = await LocationModel.find()
      .populate("project", "title")
       .sort({ "project.title": 1, date: -1 }) 
      .lean();

    if (Locations.length === 0) {
      return res.status(400).json({
        message: "Location not added. Kindly add one.",
      });
    }

    return res.status(200).json({
      message: "Locations fetched successfully.",
      Locations,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Locations due to ${error.message}`,
    });
  }
};

const deleteLocationInfo = async (req, res) => {
  try {
    const { infoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(infoId)) {
      return res.status(400).json({ message: "Invalid infoId" });
    }

    const info = await LocationModel.findOne({
      "info._id": infoId,
    });

    if (!info) {
      return res.status(404).json({
        message: "info not found in any info.",
      });
    }

    const deletedInfo= info.info.find(
      (loc) => loc._id.toString() === infoId
    );

    if (!deletedInfo) {
      return res.status(404).json({
        message: "Info not found in the array.",
      });
    }

    const updatedInfo = await LocationModel.findByIdAndUpdate(
      info._id,
      { $pull: { info: { _id: infoId } } },
      { new: true }
    );

    return res.status(200).json({
      message: "info deleted successfully.",
      deletedInfo,
      updatedInfo,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error deleting info from Location: ${error.message}`,
    });
  }
};


const deleteLocation = async (req, res) => {
  try {
    const Location = await LocationModel.findById({
      _id: req.params._id,
    });

    if (Location.length === 0) {
      return res.status(400).json({
        message: "No Location added to delete. Kindly add one.",
      });
    }

    const deletedLocation = await LocationModel.findOneAndDelete({_id: req.params._id,});

    return res.status(200).json({
      message: "Location deleted successfully.",
      deletedLocation,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Location due to ${error.message}`,
    });
  }
};

module.exports = {
  createLocation,
  updateLocation,
  getLocationsByProject,
  getLocationInfo,
  getLocation,
  getLocations,
  deleteLocationInfo,
  deleteLocation,
};
