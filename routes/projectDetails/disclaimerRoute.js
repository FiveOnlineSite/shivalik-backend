const DisclaimerController = require("../../controllers/projectDetails/disclaimerController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("disclaimers");

route.post("/", adminMiddleware, uploadMedia.single("qr"), DisclaimerController.createDisclaimer);

route.patch(
  "/:_id",
  adminMiddleware,
  uploadMedia.single("qr"),
  DisclaimerController.updateDisclaimer
);

route.get("/project/:name", DisclaimerController.getDisclaimersByProject);

route.get("/:_id", DisclaimerController.getDisclaimer);

route.get("/", DisclaimerController.getDisclaimers);

route.delete(
  "/:_id",
  adminMiddleware,
  DisclaimerController.deleteDisclaimer
);

module.exports = route;
