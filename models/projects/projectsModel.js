const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectsSchema = new mongoose.Schema({
  project_category: {
    type: String,
    enum: ["Shivalik", "Promoters"],
    default: "Shivalik",
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
  },
  disclaimer: {
    type: String,
  },
  image: {
    type: Array,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  completion_date: {
    type: String,
    required: true,
  },
  banner: {
    type: Array,
  },
  banner_alt: {
    type: String,
  },
  mobile_banner: {
    type: Array,
  },
  mobile_banner_alt: {
    type: String,
  },
  sequence: {
    type: Number,
  },
  metaTitle: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
  
  metaKeyword: {
    type: String,
  },
});

const ProjectsModel = mongoose.model("projects", ProjectsSchema);

module.exports = ProjectsModel;
