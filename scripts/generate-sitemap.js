// scripts/generate-sitemap.js
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const { SitemapStream, streamToPromise } = require('sitemap');
const Post = require('../models/Post'); // adapt path
require('dotenv').config();

const baseUrl = process.env.SITE_URL || 'https://example.com';
const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

async function run() {
  await mongoose.connect(process.env.MONGO_URI, {});

  const smStream = new SitemapStream({ hostname: baseUrl });

  // static pages
  smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
  smStream.write({ url: '/about' });

  // dynamic pages
  const posts = await Post.find({ isPublic: true }).select('slug updatedAt').lean();
  for (const p of posts) {
    smStream.write({ url: `/vinyl-flooring/applications/${p.slug}`, lastmod: p.updatedAt.toISOString() });
  }

  smStream.end();
  const data = await streamToPromise(smStream);
  await fs.outputFile(outPath, data.toString());
  console.log('Sitemap written to', outPath);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
