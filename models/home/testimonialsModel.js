const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    required: true,
    type: String,
  },
  type: {
    type: String,
    enum: ["", "image", "video"],
    default: "",
  },
  media: {
    type: Schema.Types.Mixed,
    required: function () {
      return this.type === "image" || this.type === "video";
    },
  },
  alt: {
    type: String,
  },
  sequence: {
    type: Number,
    required: true
  }
});

const TestimonialModel = mongoose.model("testimonials", TestimonialSchema);

module.exports = TestimonialModel;
