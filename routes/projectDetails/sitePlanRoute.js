const SitePlanController = require("../../controllers/projectDetails/sitePlanController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("site-plan");

route.post(
  "/",
  uploadMedia.fields([
    { name: "floor_plan", maxCount: 10 },
    { name: "unit_plan", maxCount: 10 },
  ]),
  adminMiddleware,
  SitePlanController.createSitePlan
);

route.patch(
  "/:_id",
  uploadMedia.fields([
    { name: "floor_plan", maxCount: 10 },
    { name: "unit_plan", maxCount: 10 },
  ]),
  adminMiddleware,
  SitePlanController.updateSitePlan
);

route.get("/project/:name", SitePlanController.getSitePlansByProject);

route.get("/:_id", SitePlanController.getSitePlan);

route.get("/", SitePlanController.getSitePlans);

route.delete("/:_id", adminMiddleware, SitePlanController.deleteSitePlan);

module.exports = route;
