const BlogsModel = require("../../models/blogs/blogsModel");
const path = require("path")
const BlogsFaqModel = require("../../models/blogs/blogsFaqModel")


const slugify = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")        // replace &
    .replace(/\//g, "-")  
    .replace(/['’]/g, "")       // replace /
    .replace(/[^a-z0-9]+/g, "-") // other chars → -
    .replace(/^-+|-+$/g, "");
    

const createBlog = async (req, res) => {
  try {
    const { alt, title, content, metaTitle,
      metaDescription,
      metaKeyword } = req.body;
    if (!alt || !alt.trim()) {
      return res.status(400).json({ message: "Alt text is required." });
    }

    const totalBlogs = await BlogsModel.countDocuments();

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const file = req.file;
    const extname = path.extname(file.originalname).toLowerCase();
    if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
      return res.status(400).json({ message: "Unsupported image type." });
    }

    const imageData = {
      filename: path.basename(file.key),
      filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
    };

    const newBlog = new BlogsModel({
      image: [imageData],
      alt,
      title,
      content,
      sequence: totalBlogs + 1,
      metaTitle,
      metaDescription,
      metaKeyword
    });

    await newBlog.save();

    res.status(201).json({
      message: "Blog created successfully",
      Blog: newBlog,
    });
  } catch (error) {
    res.status(500).json({ message: `Error creating Blog: ${error.message}` });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { alt, title, content
      , sequence, metaTitle,
      metaDescription,
      metaKeyword
    } = req.body;
    const BlogId = req.params._id;

    const existingBlog = await BlogsModel.findById(BlogId);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Handle image update
    if (req.file) {
      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }
      existingBlog.image = [
        {
          filename: path.basename(file.key),
          filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
        },
      ];
    }

    if (alt !== undefined) existingBlog.alt = alt;
    if (title !== undefined) existingBlog.title = title;
    if (content !== undefined) existingBlog.content = content;
    if (metaTitle !== undefined) existingBlog.metaTitle = metaTitle;
    if (metaDescription !== undefined) existingBlog.metaDescription = metaDescription;
    if (metaKeyword !== undefined) existingBlog.metaKeyword = metaKeyword;

    if (sequence && sequence !== existingBlog.sequence) {
      const allBlogs = await BlogsModel.find().sort({ sequence: 1 });
      const maxSeq = allBlogs.length;
      if (sequence > maxSeq) {
        return res
          .status(400)
          .json({ message: `Invalid sequence. Max allowed is ${maxSeq}.` });
      }

      const ops = [];
      allBlogs.forEach((b) => {
        if (b._id.toString() !== existingBlog._id.toString()) {
          if (b.sequence >= sequence && b.sequence < existingBlog.sequence) {
            ops.push({
              updateOne: { filter: { _id: b._id }, update: { $inc: { sequence: 1 } } },
            });
          } else if (b.sequence > existingBlog.sequence && b.sequence <= sequence) {
            ops.push({
              updateOne: { filter: { _id: b._id }, update: { $inc: { sequence: -1 } } },
            });
          }
        }
      });
      if (ops.length) await BlogsModel.bulkWrite(ops);

      existingBlog.sequence = sequence;
    }

    await existingBlog.save();

    res.status(200).json({
      message: "Blog updated successfully",
      updatedBlog: existingBlog,
    });
  } catch (error) {
    res.status(500).json({ message: `Error updating Blog: ${error.message}` });
  }
};

const getBlogByTitle = async (req, res) => {
  try {
      const paramSlug = slugify(req.params.title || "");
  
      // Get all apps (or you could query directly if you have many)
      const blog = await BlogsModel.find();
  
      console.log("paramSlug:", paramSlug);
  
      blog.forEach((b) =>
        console.log("db name:", JSON.stringify(b.title), "=>", slugify(b.title))
      );

      // Find the app whose normalized name matches the URL
      const matchedBlog = blog.find(
        (blog) => slugify(blog.title) === paramSlug
      );
  

      console.log("paramSlug1:", paramSlug);

      if (!matchedBlog) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      res.status(200).json({
        message: "Blog fetched successfully",
        blog: matchedBlog,
      });
    } catch (err) {
      console.error("Error fetching blog by title:", err.message);
      res.status(500).json({ message: `Server error ${err.message}` });
    }
};

const getBlog = async (req, res) => {
  try {
    const Blog = await BlogsModel.findById(req.params._id)

    if (!Blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json({
      message: "Blog fetched successfully.",
      Blog,
    });
  } catch (error) {
    console.error("Error fetching Blog:", error);
    return res.status(500).json({
      message: `Error in fetching Blog due to ${error.message}`,
    });
  }
};

const getBlogs = async (req, res) => {
  try {
    const Blogs = await BlogsModel.find().sort({sequence: 1})

    if (!Blogs.length) {
      return res.status(400).json({ message: "No Blogs found" });
    }

    return res.status(200).json({
      message: "Blogs fetched successfully.",
      BlogsCount: Blogs.length,
      Blogs,
      
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching Blogs: ${error.message}`,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { _id } = req.params;

    const Blog = await BlogsModel.findById(_id);
    if (!Blog) {
      return res.status(404).json({ message: "Product not found" });
    }
   
    const deletedSequence = Blog.sequence;

    const deletedBlog = await BlogsModel.findByIdAndDelete(req.params._id);

    if (!deletedBlog) {
      return res.status(500).json({
        message: "Error in deleting the Blog.",
      });
    }

     const deletedBlogFaq = await BlogsFaqModel.deleteMany({
          blog: _id,
        });
    const updateResult = await BlogsModel.updateMany(
      { order: { $gt: deletedSequence } },
      { $inc: { order: -1 } }
    );

    console.log(`Updated ${updateResult.modifiedCount} Blog's order.`);

    return res.status(200).json({
      message: "Blog deleted successfully.",
      deletedBlog,
      deletedBlogFaq
    });

  } catch (error) {
    return res.status(500).json({ message: `Error in deleting Blog: ${error.message}` });
  }
};

module.exports = {
  createBlog,
  updateBlog,
  getBlogByTitle,
  getBlog,
  getBlogs,
  deleteBlog,
};
