const CSRController = require("../controllers/csrController");
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const route = express.Router();

route.post("/", adminMiddleware, CSRController.createCSR);

route.patch(
  "/:_id",
  adminMiddleware,
  CSRController.updateCSR
);

route.get("/:_id", CSRController.getCSR);

route.get("/", CSRController.getCSRs);


route.delete(
  "/:_id",
  adminMiddleware,
  CSRController.deleteCSR
);

module.exports = route;
