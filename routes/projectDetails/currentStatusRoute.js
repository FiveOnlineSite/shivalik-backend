const CurrentStatusController = require("../../controllers/projectDetails/currentStatusController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");

const uploadMedia = createUpload("current-status");

route.post(
  "/",
  uploadMedia.any(),
  adminMiddleware,
  CurrentStatusController.createStatus
);

route.patch("/:_id", uploadMedia.any(), adminMiddleware, CurrentStatusController.updateStatus);

route.get("/project/:name", CurrentStatusController.getStatusByProject);

route.get("/image/:imageId", CurrentStatusController.getImages);

route.get("/:_id", CurrentStatusController.getStatus);

route.get("/", CurrentStatusController.getStatuses)

route.delete("/image/:imageId", adminMiddleware, CurrentStatusController.deleteImages);

route.delete("/:_id", adminMiddleware, CurrentStatusController.deleteStatus);

module.exports = route;
