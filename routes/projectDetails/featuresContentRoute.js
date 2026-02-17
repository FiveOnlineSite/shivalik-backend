const FeaturesController = require("../../controllers/projectDetails/featuresContentController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("features-content");

route.post(
  "/",
  uploadMedia.single("image"),
  adminMiddleware,
  FeaturesController.createFeaturesContent
);

route.patch(
  "/:_id",
  uploadMedia.single("image"),
  adminMiddleware,
  FeaturesController.updateFeaturesContent
);

route.get("/project/:name", FeaturesController.getFeatureContentByProject);

route.get("/:_id", FeaturesController.getFeaturesContent);

route.get("/", FeaturesController.getFeaturesContents);

route.delete("/:_id", adminMiddleware, FeaturesController.deleteFeaturesContent);

module.exports = route;
