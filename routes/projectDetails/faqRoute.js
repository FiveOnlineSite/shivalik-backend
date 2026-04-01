const FAQController = require("../../controllers/projectDetails/faqController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();

route.post("/", adminMiddleware, FAQController.createFAQ);

route.patch(
  "/:_id",
  adminMiddleware,
  FAQController.updateFAQ
);

route.get("/project/:name", FAQController.getFAQByProject);

route.get("/:_id", FAQController.getFAQ);

route.get("/", FAQController.getFAQs);

route.delete(
  "/:_id",
  adminMiddleware,
  FAQController.deleteFAQ
);

module.exports = route;
