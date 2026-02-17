const TestimonialsController = require("../../controllers/home/testimonialsController");
const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../../utils/s3Uploads");

const uploadMedia = createUpload("testimonials");

route.post(
  "/",
  uploadMedia.single("media"),
  adminMiddleware,
  TestimonialsController.createTestimonial
);

route.patch(
  "/:_id",
  uploadMedia.single("media"),
  adminMiddleware,
  TestimonialsController.updateTestimonial
);

route.get("/:_id", TestimonialsController.getTestimonial);

route.get("/", TestimonialsController.getTestimonials);

route.delete("/:_id", adminMiddleware, TestimonialsController.deleteTestimonial);

module.exports = route;
