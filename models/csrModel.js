const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CsrSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const CsrModel = mongoose.model("Csrs", CsrSchema);

module.exports = CsrModel;
