const BannerController = require("../controllers/bannersController");
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../utils/s3Uploads");

const uploadMedia = createUpload("banners");

route.post(
  "/",
  uploadMedia.fields([
    { name: "image", maxCount: 1 },
    { name: "mobile_image", maxCount: 1 },
  ]),
  adminMiddleware,
  BannerController.createBanner
);

route.patch(
  "/:_id",
  uploadMedia.fields([
    { name: "image", maxCount: 1 },
    { name: "mobile_image", maxCount: 1 },
  ]),
  adminMiddleware,
  BannerController.updateBanner
);

route.get("/page/:page", BannerController.getBannerByPage);

route.get("/:_id", BannerController.getBanner);

route.get("/", BannerController.getBanners);

route.delete("/:_id", adminMiddleware, BannerController.deleteBanner);

module.exports = route;
