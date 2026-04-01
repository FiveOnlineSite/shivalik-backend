const CSRBannerController = require("../controllers/csrBannerController");
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../utils/s3Uploads");

const uploadMedia = createUpload("csr-banners");

route.post(
  "/",
  uploadMedia.fields([
    { name: "image", maxCount: 1 },
    { name: "mobile_image", maxCount: 1 },
  ]),
  adminMiddleware,
  CSRBannerController.createCSRBanner
);

route.patch(
  "/:_id",
  uploadMedia.fields([
    { name: "image", maxCount: 1 },
    { name: "mobile_image", maxCount: 1 },
  ]),
  adminMiddleware,
  CSRBannerController.updateCSRBanner
);

route.get("/:_id", CSRBannerController.getCSRBanner);

route.get("/", CSRBannerController.getCSRBanners);

route.delete("/:_id", adminMiddleware, CSRBannerController.deleteCSRBanner);

module.exports = route;
