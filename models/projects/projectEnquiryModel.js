const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    page: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ProjectEnquiryModel = mongoose.model("projectenquiries", ProjectEnquirySchema);

module.exports = ProjectEnquiryModel;
