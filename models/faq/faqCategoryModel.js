const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FaqCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

const FaqCategoryModel = mongoose.model("faqcategories", FaqCategorySchema);

module.exports = FaqCategoryModel;
