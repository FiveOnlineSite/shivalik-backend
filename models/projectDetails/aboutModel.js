const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AboutSchema = new mongoose.Schema({
  project: {
   type: mongoose.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  brochure: {
    type: Array,
    required: true,
  },
});

const AboutModel = mongoose.model("abouts", AboutSchema);

module.exports = AboutModel;
