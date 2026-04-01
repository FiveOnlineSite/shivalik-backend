const AboutController = require("../../controllers/projectDetails/aboutController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("project-about");

route.post(
  "/",
  uploadMedia.fields([
    { name: "image", maxCount: 10 },
    { name: "brochure", maxCount: 10 },
  ]),
  adminMiddleware,
  AboutController.createAbout
);

route.patch(
  "/:_id",
  uploadMedia.fields([
    { name: "image", maxCount: 10 },
    { name: "brochure", maxCount: 10 },
  ]),
  adminMiddleware,
  AboutController.updateAbout
);

route.get("/project/:name", AboutController.getAboutsByProject);

route.get("/:_id", AboutController.getAbout);

route.get("/", AboutController.getAbouts);

route.delete("/:_id", adminMiddleware, AboutController.deleteAbout);

module.exports = route;
