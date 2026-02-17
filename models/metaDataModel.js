const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MetaDataSchema = new mongoose.Schema({
  metaTitle: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
  },
  metaKeyword: {
    type: String,
  },
  page: {
    type: String,
    required: true,
  },
});

const MetaDataModel = mongoose.model("Meta Data", MetaDataSchema);

module.exports = MetaDataModel;
