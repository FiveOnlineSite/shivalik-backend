const BlogsController = require("../../controllers/blogs/blogsController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");

const uploadMedia = createUpload("blogs");

route.post(
  "/",
  uploadMedia.single("image"),
  adminMiddleware,
  BlogsController.createBlog
);

route.patch(
  "/:_id",
  uploadMedia.single("image"),
  adminMiddleware,
  BlogsController.updateBlog
);

route.get("/title/:title", BlogsController.getBlogByTitle);

route.get("/:_id", BlogsController.getBlog);

route.get("/", BlogsController.getBlogs);

route.delete("/:_id", adminMiddleware, BlogsController.deleteBlog);

module.exports = route;
