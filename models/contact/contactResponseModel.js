const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactResponseSchema = new mongoose.Schema(
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
    message: {
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

const ContactResponseModel = mongoose.model("contactresponses", ContactResponseSchema);

module.exports = ContactResponseModel;
