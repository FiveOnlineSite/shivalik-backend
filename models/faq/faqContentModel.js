const mongoose = require("mongoose");
const { type } = require("os");
const Schema = mongoose.Schema;

const FaqContentSchema = new mongoose.Schema({
  question: {
        type: String,
        required: true,
    },
  answer: {
        type: String,
        required: true,
    },
  faq_category: {
    type: mongoose.Types.ObjectId,
    ref: "faqcategories",
    required: true,
  },
});

const FaqContentModel = mongoose.model("faqcontents", FaqContentSchema);

module.exports = FaqContentModel;
