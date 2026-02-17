const ProjectEnquiryModel = require("../../models/projects/projectEnquiryModel");

const createEnquiry = async (req, res, skipResponse = false) => {
  try {
    const { name, email, phone, page } = req.body;
 console.log("Enquiry received:", req.body);
    const newEnquiry = new ProjectEnquiryModel({
      name,
      email,
      phone,
      page,
    });
    await newEnquiry.save();

      return res.status(200).json({
        message: "Added Enquiry content successfully.",
        newEnquiry,
      });
  } catch (error) {
      return res.status(500).json({
        message: `Error in adding Enquiry due to ${error.message}`,
      });
  }
};


const getEnquiries = async (req, res) => {
  try {
    const Enquiries = await ProjectEnquiryModel.find();

    if (Enquiries.length === 0) {
      return res.status(400).json({
        message: "No record found to fetch",
      });
    }

    res.status(200).json({
      message: "Enquiries retrieved successfully.",
      count: Enquiries.length,
      Enquiries,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error in fetching Enquiries: ${error.message}`,
    });
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const EnquiryId = req.params._id;

    const Enquiry = await ProjectEnquiryModel.findById(EnquiryId);
    if (!Enquiry) {
      return res.status(404).json({
        message: "Enquiry not found.",
      });
    }

    await ProjectEnquiryModel.findByIdAndDelete(EnquiryId);

    res.status(200).json({
      message: "Enquiry deleted successfully.",
      deletedEnquiry: Enquiry,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error in deleting Enquiry: ${error.message}`,
    });
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  deleteEnquiry,
};