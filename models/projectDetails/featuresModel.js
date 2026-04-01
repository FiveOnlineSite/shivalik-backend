const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FeaturesSchema = new mongoose.Schema({
  project: {
   type: mongoose.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  title: {
    type: String,
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
});

const FeaturesModel = mongoose.model("features", FeaturesSchema);

module.exports = FeaturesModel;
