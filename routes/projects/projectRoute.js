const ProjectController = require("../../controllers/project/projectsController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");

const uploadMedia = createUpload("projects");

route.post(
  "/",
  uploadMedia.fields([
    { name: "image", maxCount: 1},
    { name: "banner", maxCount: 1 },
    { name: "mobile_banner", maxCount: 1 },

  ]),
  adminMiddleware,
  ProjectController.createProject
);

route.patch(
  "/:_id",
  uploadMedia.fields([
   { name: "image", maxCount: 1},
    { name: "banner", maxCount: 1 },
    { name: "mobile_banner", maxCount: 1 },
  ]),
  adminMiddleware,
  ProjectController.updateProject
);

route.get("/banners", ProjectController.getProjectWithBanners);

route.get("/project/:name", ProjectController.getBannersByProject);

route.get("/:_id", ProjectController.getProject);

route.get("/", ProjectController.getProjects);

route.delete("/:_id", adminMiddleware, ProjectController.deleteProject);

module.exports = route;
