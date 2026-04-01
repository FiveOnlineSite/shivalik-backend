const CounterController = require("../../controllers/home/countersController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();

route.post(
  "/",
  adminMiddleware,
  CounterController.createCounter
);

route.patch(
  "/:_id",
  adminMiddleware,
  CounterController.updateCounter
);

route.get("/:_id", CounterController.getCounter);

route.get("/", CounterController.getCounters);

route.delete(
  "/:_id",
  adminMiddleware,
  CounterController.deleteCounter
);

module.exports = route;
