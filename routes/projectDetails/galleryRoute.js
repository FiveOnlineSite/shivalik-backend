const GalleryController = require("../../controllers/projectDetails/galleryController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("galleries");

route.post(
  "/",
  uploadMedia.single("image"),
  adminMiddleware,
  GalleryController.createGallery
);

route.patch(
  "/:_id",
    uploadMedia.single("image"),

  adminMiddleware,
  GalleryController.updateGallery
);

route.get("/project/:name", GalleryController.getGalleriesByProject);

route.get("/:_id", GalleryController.getGallery);

route.get("/", GalleryController.getGalleries);

route.delete("/:_id", adminMiddleware, GalleryController.deleteGallery);

module.exports = route;
