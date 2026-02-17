const BanksController = require("../../controllers/projectDetails/banksController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");
const uploadMedia = createUpload("banks");

route.post("/", adminMiddleware, uploadMedia.single("image"), BanksController.createBank);

route.patch(
  "/:_id",
  adminMiddleware,
  uploadMedia.single("image"),
  BanksController.updateBank
);

route.get("/project/:name", BanksController.getBanksByProject);

route.get("/:_id", BanksController.getBank);

route.get("/", BanksController.getBanks);

route.delete(
  "/:_id",
  adminMiddleware,
  BanksController.deleteBank
);

module.exports = route;
