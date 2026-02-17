const HighLightsController = require("../../controllers/projectDetails/highlightsController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("highlights");

route.post(
  "/",
  uploadMedia.single("image"),
  adminMiddleware,
  HighLightsController.createHighlight
);

route.patch(
  "/:_id",
    uploadMedia.single("image"),

  adminMiddleware,
  HighLightsController.updateHighlight
);

route.get("/project/:name", HighLightsController.getHighlightsByProject);

route.get("/:_id", HighLightsController.getHighlight);

route.get("/", HighLightsController.getHighlights);

route.delete("/:_id", adminMiddleware, HighLightsController.deleteHighlight);

module.exports = route;
