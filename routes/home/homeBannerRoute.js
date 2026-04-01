const HomeBannerController = require("../../controllers/home/homeBannerController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");

const uploadMedia = createUpload("home-banners");

route.post(
  "/",
  uploadMedia.fields([
    { name: "image", maxCount: 1 },
    { name: "mobile_image", maxCount: 1 },
  ]),
  adminMiddleware,
  HomeBannerController.createHomeBanner
);

route.patch(
  "/:_id",
  uploadMedia.fields([
    { name: "image", maxCount: 1 },
    { name: "mobile_image", maxCount: 1 },
  ]),
  adminMiddleware,
  HomeBannerController.updateHomeBanner
);

route.get("/:_id", HomeBannerController.getHomeBanner);

route.get("/", HomeBannerController.getHomeBanners);

route.delete("/:_id", adminMiddleware, HomeBannerController.deleteHomeBanner);

module.exports = route;
