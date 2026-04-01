const TestimonialModel = require("../../models/home/testimonialsModel");
const path = require("path");

const createTestimonial = async (req, res) => {
  try {
    const { name, content} = req.body;
    const altText = req.body.alt || ""; // move here to access earlier
    let testimonialData = {};
    let fileType = "";
    
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          message:
            "Either a file or a valid URL is required for the media field.",
        });
      }
      
      const extname = path.extname(file.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);
       const isVideo = [".mp4"].includes(extname);

      if (!isImage && !isVideo)
              return res.status(400).json({ message: "Unsupported file type" });
      
            if (isImage && (!altText || altText.trim() === ""))
              return res.status(400).json({ message: "Alt text required for images" });
      
      
              const maxImageSize = 2 * 1024 * 1024; // 2 MB
          const maxVideoSize = 10 * 1024 * 1024; // 10 MB
      
            if (isImage & file.size > maxImageSize){
              return res.status(400).json({
                message: "Image size should be max 2 mb"
              })
            }
      
            if (isVideo & file.size > maxVideoSize){
              return res.status(400).json({
                message: "Video size should be max 10 mb"
              })
            }
      
            fileType = isImage ? "image" : "video";
            testimonialData = {
                  filename: path.basename(file.key), 
                  filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "images/testimonials/..."
                };

    const totalTestimonials = await TestimonialModel.countDocuments();

    const newTestimonial = new TestimonialModel({
      type: fileType,
      alt: fileType === "image" ? altText : "", // safe to use altText now
      name,
      content,
      media: testimonialData,
      sequence: totalTestimonials + 1,
    });

    await newTestimonial.save();

    return res.status(200).json({
      message: "Added new testimonial successfully.",
      newTestimonial,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in adding new testimonial due to ${error.message}`,
    });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const { name, content, alt, sequence } = req.body;
    const testimonialId = req.params._id;

    const existingTestimonial = await TestimonialModel.findById(testimonialId);
    if (!existingTestimonial) {
      return res.status(404).json({ message: "Testimonial not found." });
    }

    let altText = alt ?? existingTestimonial.alt ?? "";
    let fileType = existingTestimonial.type;
    let testimonialData = existingTestimonial.media;

    if (req.file) {
      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(ext);
      const isVideo = [".mp4"].includes(ext);

      if (!isImage && !isVideo) {
        return res.status(400).json({
          message:
            "Unsupported file type. Please upload an image (.webp, .jpg, .jpeg, .png) or video (.mp4).",
        });
      }

      if (isImage && (!altText || !altText.trim())) {
        return res
          .status(400)
          .json({ message: "Alt text is required when uploading an image." });
      }

      const maxImageSize = 2 * 1024 * 1024; // 2MB
      const maxVideoSize = 10 * 1024 * 1024; // 10MB

      if (isImage && file.size > maxImageSize) {
        return res
          .status(400)
          .json({ message: "Image size should be max 2 MB." });
      }
      if (isVideo && file.size > maxVideoSize) {
        return res
          .status(400)
          .json({ message: "Video size should be max 10 MB." });
      }

      fileType = isImage ? "image" : "video";
      testimonialData = {
        filename: path.basename(file.key),
        filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
      };
    }

     if (sequence && sequence !== existingTestimonial.sequence) {
  const testimonials = await TestimonialModel.find().sort({ sequence: 1 });

  const maxSequence = testimonials.length;
  if (sequence > maxSequence) {
    return res.status(400).json({
      message: `Invalid sequence. The sequence cannot be greater than ${maxSequence}.`,
    });
  }

  let updateOperations = [];

  testimonials.forEach((t) => {
    if (t._id.toString() !== existingTestimonial._id.toString()) {
      // If new sequence is before old sequence, increment in between
      if (sequence < existingTestimonial.sequence && t.sequence >= sequence && t.sequence < existingTestimonial.sequence) {
        updateOperations.push({
          updateOne: { filter: { _id: t._id }, update: { $inc: { sequence: 1 } } },
        });
      }
      // If new sequence is after old sequence, decrement in between
      else if (sequence > existingTestimonial.sequence && t.sequence <= sequence && t.sequence > existingTestimonial.sequence) {
        updateOperations.push({
          updateOne: { filter: { _id: t._id }, update: { $inc: { sequence: -1 } } },
        });
      }
    }
  });

  if (updateOperations.length > 0) {
    await TestimonialModel.bulkWrite(updateOperations);
  }

  // Update the testimonial sequence
  existingTestimonial.sequence = sequence;
}

    const updatedFields = {
      name: name ?? existingTestimonial.name,
      content: content ?? existingTestimonial.content,
      media: testimonialData,
      type: fileType,
      alt: fileType === "image" ? altText : "",
      sequence: existingTestimonial.sequence, // keep original if not changed
    };

    const updatedTestimonial = await TestimonialModel.findByIdAndUpdate(
      testimonialId,
      updatedFields,
      { new: true }
    );

    return res.status(200).json({
      message: "Testimonial updated successfully.",
      updatedTestimonial,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error updating testimonial: ${error.message}`,
    });
  }
};

const getTestimonial = async (req, res) => {
  try {
    const testimonial = await TestimonialModel.findById(req.params._id);

    if (!testimonial) {
      return res.status(400).json({
        message: "No testimonial is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "Testimonial fetched successfully.",
      testimonial,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching testimonial due to ${error.message}`,
    });
  }
};

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await TestimonialModel.find().sort({ sequence: 1 });

    if (testimonials.length === 0) {
      return res.status(400).json({
        message: "No testimonials are created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "All testimonials fetched successfully.",
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching testimonials due to ${error.message}`,
    });
  }
};

const deleteTestimonial = async (req, res) => {
  try {

     const { _id } = req.params;
    const testimonialExists = await TestimonialModel.findById(_id);

    if (testimonialExists.length === 0) {
      return res.status(400).json({
        message: "No testimonials are created. Kindly create one.",
      });
    }

    const deletedSequence = testimonialExists.sequence;
    
    console.log("Deleting", { deletedSequence });

        const deletedTestimonial= await TestimonialModel.findByIdAndDelete(_id);
    
        if (!deletedTestimonial) {
          return res.status(500).json({
            message: "Error in deleting the testimonial.",
          });
        }
    
        const updateResult = await TestimonialModel.updateMany(
          { sequence: { $gt: deletedSequence } },
          { $inc: { sequence: -1 } }
        );

        console.log(`Updated ${updateResult.modifiedCount} testimonial's seq.`);

    return res.status(200).json({
      message: "Testimonial deleted successfully.",
      deletedTestimonial,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting Testimonial due to ${error.message}`,
    });
  }
};

module.exports = {
  createTestimonial,
  updateTestimonial,
  getTestimonial,
  getTestimonials,
  deleteTestimonial,
};
