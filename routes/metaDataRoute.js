const metaDataController = require("../controllers/metaDataController");
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const route = express.Router();

route.post("/", adminMiddleware, metaDataController.createMetaData);

route.patch("/:_id", adminMiddleware, metaDataController.updateMetaData);

route.get("/by-id/:_id", metaDataController.getMetaDataById);

route.get("/by-page/:page", metaDataController.getMetaDataByPage);

route.get("/", metaDataController.getAllMetaDatas);

route.delete("/:_id", adminMiddleware, metaDataController.deleteMetaData);

module.exports = route;
