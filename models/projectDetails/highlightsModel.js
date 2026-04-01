const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HightlightsSchema = new mongoose.Schema({
    project: {
       type: mongoose.Types.ObjectId,
        ref: "projects",
        required: true,
      },
  title: {
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

const HightlightsModel = mongoose.model("hightlights", HightlightsSchema);

module.exports = HightlightsModel;
