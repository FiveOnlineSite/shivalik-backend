const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "admin",
  },
});

const AuthModel = mongoose.model("authentications", AuthSchema);

module.exports = AuthModel;
