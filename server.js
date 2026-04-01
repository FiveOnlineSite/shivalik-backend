const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const Route = require("./routes/index");
const cors = require("cors");
const app = express();
app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 8000;

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
  res.send("This is backend");
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
