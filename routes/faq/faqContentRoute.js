const FaqContentController = require("../../controllers/faq/faqContentController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();

route.post("/", adminMiddleware, FaqContentController.createContent);

route.patch(
  "/:_id",
  adminMiddleware,
  FaqContentController.updateContent
);

route.get("/category/:category", FaqContentController.getContentByCategory);

route.get("/:_id", FaqContentController.getContent);

route.get("/", FaqContentController.getContents);

route.delete(
  "/:_id",
  adminMiddleware,
  FaqContentController.deleteContent
);

module.exports = route;
