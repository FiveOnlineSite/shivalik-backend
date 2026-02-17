
const express = require("express");
const route = express.Router();
const ProjectEnquiryController = require("../../controllers/project/projectEnquiryController")

route.post("/", ProjectEnquiryController.createEnquiry )

route.get("/", ProjectEnquiryController.getEnquiries )

module.exports = route;
