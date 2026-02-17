const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3Client } = require("../config/s3");

const createUpload = (dynamicFolder) =>
  multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_BUCKET_NAME,
      acl: "public-read",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        let folder = `others/${dynamicFolder}`;

        if (file.mimetype.startsWith("image/")) {
          folder = `images/${dynamicFolder}`;
        } else if (file.mimetype.startsWith("video/")) {
          folder = `videos/${dynamicFolder}`;
        } else if (file.mimetype === "application/pdf") {
          folder = `pdfs/${dynamicFolder}`;
        }

        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, `${folder}/${filename}`);
      },
    }),

    limits: {
      fileSize: 10 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        if (file.size > 500 * 1024) {
          return cb(new Error("Image size must be under 500KB"));
        }
      } else if (file.mimetype.startsWith("video/")) {
        if (file.size > 10 * 1024 * 1024) {
          return cb(new Error("Video size must be under 10MB"));
        }
      } else if (file.mimetype === "application/pdf") {
        if (file.size > 5 * 1024 * 1024) {
          return cb(new Error("PDF size must be under 5MB"));
        }
      } else {
        return cb(new Error("Only images, videos, and PDFs allowed"));
      }

      cb(null, true);
    },
  });

module.exports = createUpload;
