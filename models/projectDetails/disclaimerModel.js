const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DisclaimerSchema = new mongoose.Schema({
  project: {
   type: mongoose.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  qr: {
    type: Array,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  registration_no: {
    type: String,
    required: true,
  },
   description: {
    type: String,
    required: true,
  },
  
});

const DisclaimerModel = mongoose.model("disclaimers", DisclaimerSchema);

module.exports = DisclaimerModel;
