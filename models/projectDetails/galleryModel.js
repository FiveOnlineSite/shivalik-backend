const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GallerySchema = new mongoose.Schema({
  project: {
   type: mongoose.Types.ObjectId,
    ref: "projects",
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

const GalleryModel = mongoose.model("galleries", GallerySchema);

module.exports = GalleryModel;
