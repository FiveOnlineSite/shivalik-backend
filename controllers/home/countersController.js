const CountersModel = require("../../models/home/countersModel");

const createCounter = async (req, res) => {
  try {
    const { title, number } = req.body;

    const newCounter = new CountersModel({
      title,
      number,
    });

    await newCounter.save();

    return res.status(200).json({
      message: "Counter added successfully.",
      newCounter,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding counter due to ${error.message}`,
    });
  }
};

const updateCounter = async (req, res) => {
  try {
    const { _id } = req.params;
    const { title, number} = req.body;

    const currentCounter = await CountersModel.findById(_id);
    if (!currentCounter) {
      return res
        .status(404)
        .json({ message: "Counter not found." });
    }

    const updatedFields = { title, number };

    const updatedCounter =
      await CountersModel.findByIdAndUpdate(_id, updatedFields, {
        new: true,
      });

    return res.status(200).json({
      message: "Counter updated successfully.",
      updatedCounter,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating counter due to ${error.message}`,
    });
  }
};

const getCounter = async (req, res) => {
  try {
    const counter = await CountersModel.findById(
      req.params._id
    );

    if (!counter) {
      return res.status(400).json({
        message: "No counter is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "Counter fetched successfully.",
      counter,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching counter due to ${error.message}`,
    });
  }
};

const getCounters = async (req, res) => {
  try {
    const counters = await CountersModel.find()

    if (counters.length === 0) {
      return res.status(400).json({
        message: "Counters not added. Kindly add counter.",
      });
    }
    return res.status(200).json({
      message: "Counters fetched successfully.",
      count: counters.length,
      counters,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Counters due to ${error.message}`,
    });
  }
};

const deleteCounter = async (req, res) => {
  try {
    const Counters = await CountersModel.findOne({});

    if (Counters.length === 0) {
      return res.status(400).json({
        message: "No counter added to delete. Kindly add one.",
      });
    }

    const deletedCounter =
      await CountersModel.findByIdAndDelete(
        Counters._id
      );

    return res.status(200).json({
      message: "Counter deleted successfully.",
      deletedCounter,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting counter due to ${error.message}`,
    });
  }
};

module.exports = {
  createCounter,
  updateCounter,
  getCounter,
  getCounters,
  deleteCounter,
};
