const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AwardsSchema = new mongoose.Schema({
  image: {
    type: Array,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  sequence: {
    type: Number,
    required: true,
  }
});

const AwardsModel = mongoose.model("awards", AwardsSchema);

module.exports = AwardsModel;
