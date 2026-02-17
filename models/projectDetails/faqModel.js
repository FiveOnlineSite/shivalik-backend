const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FAQSchema = new mongoose.Schema({
  project: {
   type: mongoose.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  
});

const FAQModel = mongoose.model("faqs", FAQSchema);

module.exports = FAQModel;
