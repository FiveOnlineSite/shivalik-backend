const AmenitiesController = require("../../controllers/projectDetails/amenitiesController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("amenities");

route.post(
  "/",
  uploadMedia.single("image"),
  adminMiddleware,
  AmenitiesController.createAmenity
);

route.patch(
  "/:_id",
    uploadMedia.single("image"),

  adminMiddleware,
  AmenitiesController.updateAmenity
);

route.get("/project/:name", AmenitiesController.getAmenitiesByProject);

route.get("/:_id", AmenitiesController.getAmenity);

route.get("/", AmenitiesController.getAmenities);

route.delete("/:_id", adminMiddleware, AmenitiesController.deleteAmenity);

module.exports = route;
