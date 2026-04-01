const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AmenitiesSchema = new mongoose.Schema({
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
});

const AmenitiesModel = mongoose.model("amenities", AmenitiesSchema);

module.exports = AmenitiesModel;
