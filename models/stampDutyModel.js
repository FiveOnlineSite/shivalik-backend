const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StampDutySchema = new mongoose.Schema({
  male: {
    type: String,
    required: true,
  },
  female: {
    type: String,
    required: true,
  },
  
});

const StampDutyModel = mongoose.model("stampduties", StampDutySchema);

module.exports = StampDutyModel;
