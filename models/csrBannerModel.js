const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CSRBannerSchema = new mongoose.Schema({
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

const CSRBannerModel = mongoose.model("csrbanners", CSRBannerSchema);

module.exports = CSRBannerModel;
