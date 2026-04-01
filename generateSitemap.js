// scripts/generate-sitemap.js
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const { SitemapStream, streamToPromise } = require('sitemap');

// Models
const BlogsModel = require('./models/blogs/blogsModel');

require('dotenv').config();

const baseUrl = process.env.PROD_URL || 'https://shivalik-9f9t.onrender.com';
const outPath = path.join(__dirname, '../frontend', 'public', 'sitemap.xml');

// Helper to generate slug from title
function generateSlug(str) {
  return str
   .toLowerCase()
                  .trim()
                  .replace(/&/g, "and")
                  .replace(/['’]/g, "")   // remove apostrophes
                  .replace(/\//g, "-")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")
                  }

async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB_URL, {});
    console.log('✅ Connected to MongoDB');

    const smStream = new SitemapStream({ hostname: baseUrl });

    // -------------------
    // STATIC PAGES
    // -------------------
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/about-us', changefreq: 'weekly', priority: 0.8 },
      { url: '/contact-us', changefreq: 'weekly', priority: 0.8 },
      { url: '/projects', changefreq: 'weekly', priority: 0.7 },
      { url: '/csr', changefreq: 'weekly', priority: 0.7 },
      { url: '/faqs', changefreq: 'weekly', priority: 0.7 },
      { url: '/emi-calculator', changefreq: 'weekly', priority: 0.7 },
      { url: '/stamp-duty-calculator', changefreq: 'weekly', priority: 0.7 },
      { url: '/news', changefreq: 'weekly', priority: 0.7 },
      { url: '/blogs', changefreq: 'monthly', priority: 0.6 },
      { url: '/project/gulmohar-avenue', changefreq: 'monthly', priority: 0.6 },
      { url: '/project/prabhat-darshan', changefreq: 'monthly', priority: 0.6 },

    ];

    staticPages.forEach(page => smStream.write(page));

    // -------------------
    // DYNAMIC PAGES
    // -------------------
    const dynamicModels = [
      { model: BlogsModel, urlPrefix: '/blog/' },
   ];

    for (const { model, urlPrefix } of dynamicModels) {
      const docs = await model.find({}).select('title updatedAt').lean(); // fetch all documents

      for (const doc of docs) {
        // Generate slug from title or fallback to _id
        const slug = doc.title ? generateSlug(doc.title) : doc._id;

        smStream.write({
          url: `${urlPrefix}${slug}`,
          lastmod: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }

    // -------------------
    // FINALIZE SITEMAP
    // -------------------
    smStream.end();
    const data = await streamToPromise(smStream);
    await fs.outputFile(outPath, data.toString());
    console.log('✅ Sitemap written to', outPath);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();
