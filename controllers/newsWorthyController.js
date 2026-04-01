const NewsWorthyMentionModel = require("../models/newsWorthyMentionModel")
const path = require("path")

const createNewsWorthyMention = async (req, res) => {
  try {
    const { news_category, title, publisher_name, date, link, alt } = req.body;

    if (!["News", "Worthy Mentions"].includes(news_category)) {
      return res.status(400).json({ message: "Category must be 'news' or 'worthy mentions'" });
    }

    let imageData = [];
    if (req.file) {
      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(ext)) {
        return res.status(400).json({ message: "Unsupported image type." });
      }
      if (!alt || !alt.trim()) {
        return res.status(400).json({ message: "Alt text is required." });
      }

      imageData.push({
        filename: path.basename(file.key),
        filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
      });
    }

    const lastItem = await NewsWorthyMentionModel
      .findOne({ news_category })
      .sort({ sequence: -1 });

    const newSeq = lastItem ? lastItem.sequence + 1 : 1;

    const doc = await NewsWorthyMentionModel.create({
      news_category,
      title,
      publisher_name,
      date,
      link,
      image: imageData,
      alt,
      sequence: newSeq,
    });

    res.status(201).json({ message: "Created successfully", doc });
  } catch (err) {
    res.status(500).json({ message: `Create error: ${err.message}` });
  }
};
 
const updateNewsWorthyMention = async (req, res) => {
  try {
    const { title, news_category, publisher_name, date, link, alt, sequence } = req.body;
    const id = req.params._id;

    const existing = await NewsWorthyMentionModel.findById(id);
    if (!existing) return res.status(404).json({ message: "News Worthy Mention not found" });

    const category = news_category || existing.news_category;
    if (!["News", "Worthy Mentions"].includes(category)) {
      return res.status(400).json({ message: "Invalid category. Use 'News' or 'Worthy Mentions'." });
    }

    // --- image upload (unchanged) ---
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res.status(400).json({ message: `Unsupported file type: ${ext}` });
      }
      existing.image = [
        {
          filename: path.basename(req.file.key),
          filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`,
        },
      ];
    }

    let newSeq;

    if (sequence !== undefined && sequence !== "") {
      // ----- user provided a sequence -----
      newSeq = parseInt(sequence, 10);
      if (isNaN(newSeq) || newSeq < 1) {
        return res.status(400).json({ message: "Sequence must be a positive number." });
      }

      const docs = await NewsWorthyMentionModel.find({ news_category: category }).sort({ sequence: 1 });
      const allowedMax = docs.length > 0 ? docs.length : 1;
      if (newSeq > allowedMax) {
        return res.status(400).json({ message: `Invalid sequence. Sequence cannot be greater than ${allowedMax}.` });
      }

      // reorder inside same category
      const ops = [];
      docs.forEach((doc) => {
        if (doc._id.equals(existing._id)) return;
        if (doc.sequence >= newSeq && doc.sequence < existing.sequence) {
          ops.push({ updateOne: { filter: { _id: doc._id }, update: { $inc: { sequence: 1 } } } });
        }
        if (doc.sequence <= newSeq && doc.sequence > existing.sequence) {
          ops.push({ updateOne: { filter: { _id: doc._id }, update: { $inc: { sequence: -1 } } } });
        }
      });
      if (ops.length) await NewsWorthyMentionModel.bulkWrite(ops);
    } else {
      // ----- no sequence provided -----
      if (category !== existing.news_category) {
        // free slot in old category
        await NewsWorthyMentionModel.updateMany(
          {
            news_category: existing.news_category,
            sequence: { $gt: existing.sequence },
          },
          { $inc: { sequence: -1 } }
        );

        // put at end of new category
        const count = await NewsWorthyMentionModel.countDocuments({ news_category: category });
        newSeq = count + 1;
      } else {
        newSeq = existing.sequence;
      }
    }

    existing.sequence = newSeq ?? existing.sequence;
    existing.news_category = category;
    if (alt !== undefined) existing.alt = alt;
    if (date !== undefined) existing.date = date;
    if (title !== undefined) existing.title = title;
    if (publisher_name !== undefined) existing.publisher_name = publisher_name;
    if (link !== undefined) existing.link = link;

    const updated = await existing.save();
    res.status(200).json({ message: "Updated successfully", updatedNewsWorthyMention: updated });
  } catch (err) {
    res.status(500).json({ message: `Error updating: ${err.message}` });
  }
};


const getNewsWorthyMentionsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    // Allow only "news" or "worthy mentions"
    const allowedCategories = ["News", "Worthy Mentions"];

    // Build filter
    let filter = {};
    if (category) {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          message: "Invalid category. Allowed values: 'news', 'worthy mentions'.",
        });
      }
      filter.news_category = category;
    }

    // Fetch items, sorted by sequence in ascending order
    const items = await NewsWorthyMentionModel.find(filter).sort({ sequence: 1 });

    if (!items.length) {
      return res.status(404).json({
        message: "No NewsWorthyMentions found for the given criteria.",
      });
    }

    return res.status(200).json({
      message: "All NewsWorthyMentions fetched successfully.",
      count: items.length,
      NewsWorthyMentions: items,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching NewsWorthyMentions: ${error.message}`,
    });
  }
};

const getNewsWorthyMention = async (req, res) => {
  try {

    const {_id} = req.params;
    const NewsWorthyMention = await NewsWorthyMentionModel.findById(_id);

    if (!NewsWorthyMention) {
      return res.status(400).json({
        message: "No NewsWorthyMention is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "NewsWorthyMention fetched successfully.",
      NewsWorthyMention,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching NewsWorthyMention due to ${error.message}`,
    });
  }
};

const getNewsWorthyMentions = async (req, res) => {
  try {
    const items = await NewsWorthyMentionModel
      .find()
      .sort({ news_category: 1, sequence: 1 }); // first by category, then by sequence

    if (!items.length) {
      return res.status(404).json({
        message: "No NewsWorthyMentions found. Kindly create one.",
      });
    }

    return res.status(200).json({
      message: "All NewsWorthyMentions fetched successfully.",
      count: items.length,
      NewsWorthyMentions: items,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching NewsWorthyMentions: ${error.message}`,
    });
  }
};

const deleteNewsWorthyMention = async (req, res) => {
  try {
    const { _id } = req.params;
    const item = await NewsWorthyMentionModel.findById(_id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const cat = item.news_category;
    const seq = item.sequence;

    await item.deleteOne();

    // shift down items after this sequence
    await NewsWorthyMentionModel.updateMany(
      { news_category: cat, sequence: { $gt: seq } },
      { $inc: { sequence: -1 } }
    );

    res.json({ message: "Deleted and re-sequenced" });
  } catch (err) {
    res.status(500).json({ message: `Delete error: ${err.message}` });
  }
};



module.exports = {
  createNewsWorthyMention,
  updateNewsWorthyMention,
  getNewsWorthyMentionsByCategory,
  getNewsWorthyMention,
  getNewsWorthyMentions,
  deleteNewsWorthyMention
}

