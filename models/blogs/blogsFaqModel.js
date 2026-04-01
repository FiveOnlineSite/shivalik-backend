const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogFaqSchema = new mongoose.Schema({
  blog: {
   type: mongoose.Types.ObjectId,
    ref: "blogs",
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

const BlogFaqModel = mongoose.model("blogsfaqs", BlogFaqSchema);

module.exports = BlogFaqModel;
