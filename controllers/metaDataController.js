const MetaDataModel = require("../models/metaDataModel");

const createMetaData = async (req, res) => {
  const { page, metaTitle, metaDescription, metaKeyword } = req.body;
 const existingPage = await MetaDataModel.findOne({ page: page.trim() });
    if (existingPage)
      return res
        .status(400)
        .json({ message: "Meta data already exists for this page" });

  try {
    const newMetaData = new MetaDataModel({
      page,
      metaTitle,
      metaDescription,
      metaKeyword,
    });

    await newMetaData.save();

    res.status(201).json({ message: "Meta data created successfully" });
  } catch (error) {
    console.error("Error creating meta data:", error);
    res
      .status(500)
      .json({ message: "Error creating meta data: " + error.message });
  }
};

const updateMetaData = async (req, res) => {
  try {
    const { metaTitle, metaDescription, metaKeyword, page} = req.body;

    const existingMetaData = await MetaDataModel.findById(req.params._id);

    if (!existingMetaData) {
      return res.status(404).json({ message: "Meta data already exist." });
    }
   
    let updatedPage = existingMetaData.page;

    if (page && page !== existingMetaData.page) {
      const conflictingMetaData = await MetaDataModel.findOne({ page });

      if (conflictingMetaData) {
        // Swap pages
        await MetaDataModel.findByIdAndUpdate(conflictingMetaData._id, {
          page: existingMetaData.page,
        });

        updatedPage = page; 
      }
    }

    const updatedFields = {
      page: updatedPage,
      metaTitle,
      metaKeyword,
      metaDescription
    };

    const updatedMetaData = await MetaDataModel.findByIdAndUpdate(
      req.params._id,
      updatedFields,
      { new: true }
    );

    return res.status(200).json({
      message: "Meta data updated successfully.",
      updatedMetaData,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating meta data due to ${error.message}`,
    });
  }
};

const getMetaDataById = async (req, res) => {
  try {
    const metaData = await MetaDataModel.findById(req.params._id);

    if (!metaData) {
      return res
        .status(404)
        .json({ message: "Meta data not found for this id." });
    }

    res.status(200).json(metaData);
  } catch (error) {
    res
      .status(500)
      .json({ message: ` Error fetching meta data: ${error.message}` });
  }
};

const getMetaDataByPage = async (req, res) => {
  try {
    let page = req.params.page || "";

    if (page === "") {
      page = "/";
    } else if (!page.startsWith("/")) {
      page = "/" + page;
    }

    const metaData = await MetaDataModel.findOne({ page });

    if (!metaData) {
      return res.status(404).json({ message: "Meta data not found for this page." });
    }

    res.status(200).json(metaData);
  } catch (error) {
    res.status(500).json({ message: `Error fetching meta data: ${error.message}` });
  }
};

const getAllMetaDatas = async (req, res) => {
  try {
    const metaData = await MetaDataModel.find();

    if (!metaData) {
      return res
        .status(404)
        .json({ message: "Meta data not found for this id." });
    }

    res.status(200).json({
      message: "All meta datas fetched successfully.",

      count: metaData.length,
      metaData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: ` Error fetching meta data: ${error.message}` });
  }
};

const deleteMetaData = async (req, res) => {
  try {
    const metaData = await MetaDataModel.findById(req.params._id);

    if (!metaData) {
      return res.status(400).json({
        message: "meta data not found.",
      });
    }

    const deletedMetaData = await MetaDataModel.findByIdAndDelete(
      req.params._id
    );

    if (!deletedMetaData) {
      return res.status(500).json({
        message: "Error in deleting the meta data.",
      });
    }

    return res.status(200).json({
      message: "meta data deleted successfully.",
      deletedMetaData,
    });
  } catch (error) {
    console.error(`Error in deleting meta data: ${error.message}`);
    return res.status(500).json({
      message: `Error in deleting meta data due to ${error.message}`,
    });
  }
};

module.exports = {
  createMetaData,
  getMetaDataById,
  getMetaDataByPage,
  getAllMetaDatas,
  updateMetaData,
  deleteMetaData,
};
