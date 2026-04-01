const AwardsRecognition = require("../controllers/awardsRecognitionController");
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../utils/s3Uploads");

const uploadMedia = createUpload("awards");

route.post(
  "/",
  uploadMedia.single("image"),
  adminMiddleware,
  AwardsRecognition.createAward
);

route.patch(
  "/:_id",
  uploadMedia.single("image"),
  adminMiddleware,
  AwardsRecognition.updateAward
);

route.get("/:_id", AwardsRecognition.getAward);

route.get("/", AwardsRecognition.getAwards);

route.delete("/:_id", adminMiddleware, AwardsRecognition.deleteAward);

module.exports = route;
