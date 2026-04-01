const CsrModel = require("../models/csrModel")

const createCSR = async (req, res) => {
  try {
    const { title, description} = req.body;

    const newCsr = new CsrModel({
      title,
      description,
    });

    await newCsr.save();

    return res.status(200).json({
      message: "CSR added successfully.",
      newCsr,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding CSR due to ${error.message}`,
    });
  }
};

const updateCSR = async (req, res) => {
  try {
    const { title, description} = req.body;
    const csrId = req.params._id;

    const currentCSR = await CsrModel.findById(req.params._id);
    if (!currentCSR) {
      return res
        .status(404)
        .json({ message: "CSR not found." });
    }

     const updatedFields = {};

    if (typeof title !== "undefined")
      updatedFields.title = title;
    if (typeof description !== "undefined") updatedFields.description = description;

    const updatedCSR =
      await CsrModel.findByIdAndUpdate(currentCSR._id, 
      { $set: updatedFields },
      { new: true });

    return res.status(200).json({
      message: "CSR updated successfully.",
      updatedCSR,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating CSR due to ${error.message}`,
    });
  }
};

const getCSR = async (req, res) => {
  try {
    const csr = await CsrModel.findById(req.params._id)

    if (!csr) {
      return res.status(400).json({
        message: "No CSR is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "CSR fetched successfully.",
      csr,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching CSR due to ${error.message}`,
    });
  }
};

const getCSRs = async (req, res) => {
  try {
    const csr = await CsrModel.find();

    if (csr.length === 0) {
      return res.status(400).json({
        message: "No csr are created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "All csr fetched successfully.",
      count: csr.length,
      csr,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching csr due to ${error.message}`,
    });
  }
};

const deleteCSR = async (req, res) => {
  try {
    const Csr = await CsrModel.findById({ _id: req.params._id,});

    if (Csr.length === 0) {
      return res.status(400).json({
        message: "No CSR added to delete. Kindly add one.",
      });
    }

    const deletedCsr =
      await CsrModel.findOneAndDelete({
              _id: req.params._id,
      });

    return res.status(200).json({
      message: "CSR deleted successfully.",
      deletedCsr,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting CSR due to ${error.message}`,
    });
  }
};

module.exports = {
  createCSR,
  updateCSR,
  getCSR,
  getCSRs,
  deleteCSR,
};
