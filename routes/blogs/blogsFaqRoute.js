const BlogsFaqController = require("../../controllers/blogs/blogsFaqController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();

route.post("/", adminMiddleware, BlogsFaqController.createBlogFaq);

route.patch(
  "/:_id",
  adminMiddleware,
  BlogsFaqController.updateBlogFaq
);

route.get("/blog/:title", BlogsFaqController.getBlogFaqByBlog);

route.get("/:_id", BlogsFaqController.getBlogFaq);

route.get("/", BlogsFaqController.getBlogFaqs);

route.delete(
  "/:_id",
  adminMiddleware,
  BlogsFaqController.deleteBlogFaq
);

module.exports = route;
