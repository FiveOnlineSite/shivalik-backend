const FAQCategoryController = require("../../controllers/faq/faqCategoryController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();

route.post("/", adminMiddleware, FAQCategoryController.createCategory);

route.patch(
  "/:_id",
  adminMiddleware,
  FAQCategoryController.updateCategory
);

route.get("/:_id", FAQCategoryController.getCategory);

route.get("/", FAQCategoryController.getCategories);

route.delete(
  "/:_id",
  adminMiddleware,
  FAQCategoryController.deleteCategory
);

module.exports = route;
