const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HomeBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  link: {
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
  mobile_image: {
    type: Array,
    required: true,
  },
  mobile_alt: {
    type: String,
    required: true,
  },
  sequence: {
    type: Number,
  }
});

const HomeBannerModel = mongoose.model("homebanners", HomeBannerSchema);

module.exports = HomeBannerModel;
