const FeaturesController = require("../../controllers/projectDetails/featuresController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("features");

route.post(
  "/",
  uploadMedia.single("image"),
  adminMiddleware,
  FeaturesController.createFeature
);

route.patch(
  "/:_id",
  uploadMedia.single("image"),
  adminMiddleware,
  FeaturesController.updateFeature
);

route.get("/project/:name", FeaturesController.getFeaturesByProject);

route.get("/:_id", FeaturesController.getFeature);

route.get("/", FeaturesController.getFeatures);

route.delete("/:_id", adminMiddleware, FeaturesController.deleteFeature);

module.exports = route;
