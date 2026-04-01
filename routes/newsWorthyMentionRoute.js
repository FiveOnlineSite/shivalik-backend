const NewsWorthyMentionController = require("../controllers/newsWorthyController");
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const route = express.Router();
const createUpload = require("../utils/s3Uploads");

const uploadMedia = createUpload("news-worthy-mentions");

route.post(
  "/",
  uploadMedia.single("image"),
  adminMiddleware,
  NewsWorthyMentionController.createNewsWorthyMention
);

route.patch(
  "/:_id",
  uploadMedia.single("image"),
  adminMiddleware,
  NewsWorthyMentionController.updateNewsWorthyMention
);

route.get("/category/:category", NewsWorthyMentionController.getNewsWorthyMentionsByCategory);

route.get("/:_id", NewsWorthyMentionController.getNewsWorthyMention);

route.get("/", NewsWorthyMentionController.getNewsWorthyMentions);

route.delete("/:_id", adminMiddleware, NewsWorthyMentionController.deleteNewsWorthyMention);

module.exports = route;
