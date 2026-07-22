const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const compression = require("compression");
const connectDb = require("./config/db");
const Route = require("./routes/index");
const cors = require("cors");
const app = express();
app.use(compression());
app.use(express.json());


const PORT = process.env.PORT || 8000;

// ✅ Redirect trailing slash URLs first
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith("/")) {
    const query = req.url.slice(req.path.length);
    const cleanPath = req.path.slice(0, -1);

    return res.redirect(301, cleanPath + query);
  }

  next();
});


app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Let browsers revalidate (304) instead of re-downloading unchanged GET
// responses. "no-cache" forces revalidation on every use, so admin edits
// are never served stale — it just skips the body on unchanged GET requests, works with the ETag express already sets.
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.set("Cache-Control", "public, no-cache");
  }
  next();
});

// Increase body limit for large videos
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// Increase server timeout
app.use((req, res, next) => {
  req.setTimeout(10 * 60 * 1000); // 10 minutes
  res.setTimeout(10 * 60 * 1000); // 10 minutes
  next();
});

connectDb();

app.get("/api", (req, res) => {
  res.send("Shivalik API is running");
});

app.get("/debug-env", (req, res) => {
  res.json({
    smtpUser: process.env.SMTP_USER || "missing",
    smtpPass: process.env.SMTP_PASS ? "exists" : "missing",
  });
});

//added for debugging env variables (remove in production))
app.get("/debug-env", (req, res) => {
  res.json({
    smtpUser: process.env.SMTP_USER || "missing",
    smtpPass: process.env.SMTP_PASS ? "exists" : "missing",
  });
});

app.use("/api/auth", Route.authRoute);
app.use("/api/home-banner", Route.homeBannerRoute);
app.use("/api/counter", Route.counterRoute);
app.use("/api/testimonial", Route.testimonialRoute);
app.use("/api/banner", Route.bannerRoute);
app.use("/api/award", Route.awardsRecognitionRoute);
app.use("/api/faq-category", Route.faqCategoryRoute);
app.use("/api/faq-content", Route.faqContentRoute);
app.use("/api/csr", Route.csrRoute);
app.use("/api/stamp-duty", Route.stampDutyRoute);
app.use("/api/news-worthy-mention", Route.newsWorthyMentionRoute);
app.use("/api/contact-response", Route.contactResponseRoute);
app.use("/api/contact-content", Route.contactContentRoute);
app.use("/api/blog", Route.blogsRoute);
app.use("/api/blog-faq", Route.blogsFaqRoute);
app.use("/api/project", Route.projectRoute);
app.use("/api/about", Route.aboutRoute);
app.use("/api/feature-content", Route.featuresContentRoute);
app.use("/api/feature", Route.featuresRoute);
app.use("/api/site-plan", Route.sitePlanRoute);
app.use("/api/highlight", Route.highlightsRoute);
app.use("/api/amenity", Route.amenitiesRoute);
app.use("/api/gallery", Route.galleryRoute);
app.use("/api/bank", Route.banksRoute);
app.use("/api/disclaimer", Route.disclaimerRoute);
app.use("/api/faq", Route.faqRoute);
app.use("/api/current-status", Route.currentStatusRoute);
app.use("/api/location", Route.locationRoute);
app.use("/api/meta-data", Route.metaDataRoute);
app.use("/api/project-enquiry", Route.projectEnquiryRoute);
app.use("/api/csr-banner", Route.csrBannerRoute);



// generateSitemap();

app.listen(PORT, "0.0.0.0", (error) => {
  if (error) {
    console.log(`Server connection failed due to ${error}`);
  }
  console.log(`Server is running on port ${PORT}`);
});
