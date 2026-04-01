const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewsWorthyMentionSchema = new mongoose.Schema({
  news_category: {
    type: String,
    enum: ["News", "Worthy Mentions"],
    default: "News",
  },
  title: {
    type: String,
    required: true,
  },
  publisher_name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  image:{
    type: Array,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  sequence: {
    type: Number,
    required: true,
  }
});

const NewsWorthyMentionModel = mongoose.model("newsworthymentions", NewsWorthyMentionSchema);

module.exports = NewsWorthyMentionModel;
