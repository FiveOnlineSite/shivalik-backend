const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SitePlanSchema = new mongoose.Schema({
  project: {
    type: mongoose.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  site_plan: {
    type: String,
    required: true,
  },
  floor_plan: {
    type: Array,
    required: true,
  },
  floor_plan_alt: {
    type: String,
    required: true,
  },
  unit_plan: {
    type: Array,
    required: true,
  },
  unit_plan_alt: {
    type: String,
    required: true,
  }
});

const SitePlanModel = mongoose.model("siteplans", SitePlanSchema);

module.exports = SitePlanModel;
