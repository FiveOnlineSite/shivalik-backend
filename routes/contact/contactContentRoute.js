const ContactContentController = require("../../controllers/contact/contactContentController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");

const uploadMedia = createUpload("social-media");

route.post(
  "/",
  uploadMedia.array("icon", 10),
  adminMiddleware,
  ContactContentController.createContactContent
);

route.patch("/", uploadMedia.any(), adminMiddleware, ContactContentController.updateContactContent);

route.get("/:socialMediaId", ContactContentController.getSocialMedia);

route.get("/", ContactContentController.getContactContent);

route.delete("/:socialMediaId", adminMiddleware, ContactContentController.deleteSocialMedia);

route.delete("/", adminMiddleware, ContactContentController.deleteContactContent);

module.exports = route;
