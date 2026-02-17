const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CounterSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  title: {
    required: true,
    type: String,
  },
});

const CounterModel = mongoose.model("counters", CounterSchema);

module.exports = CounterModel;
