const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BannerSchema = new mongoose.Schema({
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
  page: {
    type: String,
    required: true,
  }
});

const BannerModel = mongoose.model("banners", BannerSchema);

module.exports = BannerModel;
