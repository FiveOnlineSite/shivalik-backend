const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactContentSchema = new mongoose.Schema(
  {
    phone_number: {
      type: String,
      required: true,
    },
    emails: {
      type: String,
      required: true,
    },
    office_address: {
      type: String,
      required: true,
    },
    social_media: [
    {
      icon: {
        type: Array,
        required: true,
      },
      alt: {
        type: String,
        required: true,
      },
      link: {
        type: String,
        required: true,
      }
    },
    ],
    map_link: {
        type: String,
    }
  },
  {
    timestamps: true,
  }
);

const ContactContentModel = mongoose.model("contactcontents",ContactContentSchema);

module.exports = ContactContentModel;
