const LocationController = require("../../controllers/projectDetails/locationController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();

route.post( 
  "/",
  adminMiddleware,
  LocationController.createLocation
);

route.patch("/:_id",  adminMiddleware, LocationController.updateLocation);

route.get("/project/:name", LocationController.getLocationsByProject);

route.get("/info/:infoId", LocationController.getLocationInfo);

route.get("/:_id", LocationController.getLocation);

route.get("/", LocationController.getLocations)

route.delete("/info/:infoId", adminMiddleware, LocationController.deleteLocationInfo);

route.delete("/:_id", adminMiddleware, LocationController.deleteLocation);

module.exports = route;
