const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BanksSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
  },
  
});

const BanksModel = mongoose.model("banks", BanksSchema);

module.exports = BanksModel;
