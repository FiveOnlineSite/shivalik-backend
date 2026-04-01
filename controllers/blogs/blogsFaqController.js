const BlogModel = require("../../models/blogs/blogsModel");
const BlogFaqModel = require("../../models/blogs/blogsFaqModel")
const mongoose = require("mongoose")

const createBlogFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const { blog } = req.body;
    console.log("blog id", blog, typeof blog);

    const blogExist = await BlogModel.findById(
      blog
    );

    if (!blogExist) {
      return res.status(400).json({ message: "Blog not found" });
    }

    const newBlogFaq = new BlogFaqModel({
      question,
      answer,
      blog
    });

    await newBlogFaq.save();

    return res.status(200).json({
      message: "Blog Faq added successfully.",
      newBlogFaq,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding Blog Faq due to ${error.message}`,
    });
  }
};

const updateBlogFaq = async (req, res) => {
  try {
    const { _id } = req.params;
    const { question, answer, blog} = req.body;

    const currentBlogFaq = await BlogFaqModel.findById(_id);
    if (!currentBlogFaq) {
      return res
        .status(404)
        .json({ message: "Blog Faq not found." });
    }

     if (blog) {
      if (!mongoose.Types.ObjectId.isValid(blog)) {
        return res.status(400).json({ message: "Invalid blog ID" });
      }

      const blogExist = await BlogModel.findById(
        blog
      );
      if (!blogExist) {
        return res.status(400).json({ message: "blogs not found" });
      }
    }

    const updatedFields = { question, answer, blog };

    const updatedBlogFaq =
      await BlogFaqModel.findByIdAndUpdate(_id, updatedFields, {
        new: true,
      });

    return res.status(200).json({
      message: "Blog Faq updated successfully.",
      updatedBlogFaq,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating Blog Faq due to ${error.message}`,
    });
  }
};

const getBlogFaqByBlog = async (req, res) => {
  try {
    let blog = req.params.title || "";

    const normalize = (str) =>
      str?.toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/['’]/g, "")  
      .replace(/\//g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const faqs = await BlogFaqModel.find().populate("blog");

    // compare normalized names
    const blogFaqs = faqs.filter(
      (faq) => normalize(faq.blog?.title) === normalize(blog)
    );

    if (!blogFaqs || blogFaqs.length === 0) {
      return res
        .status(404)
        .json({ message: "No blogFaqs found for this blog" });
    }

    res.status(200).json({
      message: "blogFaqs fetched by blog successfully",
      blogFaqs,
    });
  } catch (err) {
    console.error("Error fetching blogFaqs by blog title:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getBlogFaq = async (req, res) => {
  try {
    const BlogFaq = await BlogFaqModel.findById(
      req.params._id
    );

    if (!BlogFaq) {
      return res.status(400).json({
        message: "No Blog Faq is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "Blog Faq fetched successfully.",
      BlogFaq,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Blog Faq due to ${error.message}`,
    });
  }
};

const getBlogFaqs = async (req, res) => {
  try {
    const BlogFaqs = await BlogFaqModel.find().populate("blog", "title")

    if (BlogFaqs.length === 0) {
      return res.status(400).json({
        message: "Blog Faqs not added. Kindly add BlogFaq.",
      });
    }
    return res.status(200).json({
      message: "Blog Faqs fetched successfully.",
      count: BlogFaqs.length,
      BlogFaqs,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching Blog Faqs due to ${error.message}`,
    });
  }
};

const deleteBlogFaq = async (req, res) => {
  try {
    const BlogFaqs = await BlogFaqModel.findOne({});

    if (BlogFaqs.length === 0) {
      return res.status(400).json({
        message: "No Blog Faq added to delete. Kindly add one.",
      });
    }

    const deletedBlogFaq =
      await BlogFaqModel.findByIdAndDelete(
        BlogFaqs._id
      );

    return res.status(200).json({
      message: "Blog Faq deleted successfully.",
      deletedBlogFaq,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Blog Faq due to ${error.message}`,
    });
  }
};

module.exports = {
  createBlogFaq,
  updateBlogFaq,
  getBlogFaqByBlog,
  getBlogFaq,
  getBlogFaqs,
  deleteBlogFaq,
};
