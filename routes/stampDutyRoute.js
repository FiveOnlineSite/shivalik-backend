const StampDutyController = require("../controllers/stampDutyController");
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const route = express.Router();

route.post("/", adminMiddleware, StampDutyController.createStampDuty);

route.patch(
  "/",
  adminMiddleware,
  StampDutyController.updateStampDuty
);

route.get("/", StampDutyController.getStampDuty);

route.delete(
  "/",
  adminMiddleware,
  StampDutyController.deleteStampDuty
);

module.exports = route;
