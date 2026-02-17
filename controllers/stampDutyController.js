const StampDutyModel = require("../models/stampDutyModel")

const createStampDuty = async (req, res) => {
  try {
    const { male, female } = req.body;

    const newStampDuty = new StampDutyModel({
      male, female
    });

    await newStampDuty.save();

    return res.status(200).json({
      message: "StampDuty added successfully.",
      newStampDuty,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding StampDuty due to ${error.message}`,
    });
  }
};

const updateStampDuty = async (req, res) => {
  try {
    const {male, female} = req.body;

    const currentStampDuty = await StampDutyModel.findOne({});
    if (!currentStampDuty) {
      return res
        .status(404)
        .json({ message: "StampDuty not found." });
    }

     const updatedFields = {};

    if (typeof male !== "undefined")
      updatedFields.male = male;
    if (typeof female !== "undefined")
      updatedFields.female = female;

    const updatedStampDuty =
      await StampDutyModel.findByIdAndUpdate(currentStampDuty._id, 
      { $set: updatedFields },
      { new: true });

    return res.status(200).json({
      message: "StampDuty updated successfully.",
      updatedStampDuty,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating StampDuty due to ${error.message}`,
    });
  }
};

const getStampDuty = async (req, res) => {
  try {
    const StampDuty = await StampDutyModel.findOne({})

    if (!StampDuty) {
      return res.status(400).json({
        message: "No StampDuty is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "StampDuty fetched successfully.",
      StampDuty,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching StampDuty due to ${error.message}`,
    });
  }
};


const deleteStampDuty = async (req, res) => {
  try {
    const StampDuty = await StampDutyModel.findOne({});

    if (StampDuty.length === 0) {
      return res.status(400).json({
        message: "No StampDuty added to delete. Kindly add one.",
      });
    }

    const deletedStampDuty =
      await StampDutyModel.findByIdAndDelete(
        StampDuty._id
      );

    return res.status(200).json({
      message: "StampDuty deleted successfully.",
      deletedStampDuty,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting StampDuty due to ${error.message}`,
    });
  }
};

module.exports = {
  createStampDuty,
  updateStampDuty,
  getStampDuty,
  deleteStampDuty,
};
