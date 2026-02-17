const mongoose = require("mongoose");

const CurrentStatusSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  images: [
    {
      image: {  
        type: Array,
        required: true,
      },
      alt: { type: String }
    }
  ],
  status: {
    type: String,
    enum: ["Ongoing Construction", "Completed"],
    default: "Ongoing Construction",
  },
  possession: {
    type: String,
    required: true,
  },
  maharera: {
    type: String,
    required: true,
  },
}, { timestamps: true });


module.exports = mongoose.model("currentstatus", CurrentStatusSchema);
