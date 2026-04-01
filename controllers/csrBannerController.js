const CSRBannerModel = require("../models/csrBannerModel")
const path = require("path")

const createCSRBanner = async (req, res) => {
  try {
    const { title, alt, mobile_alt } = req.body;

    let imageData = {};
    let mobileImageData = {};

    if (req.files && req.files.image && req.files.image[0]) {
      const imageFile = req.files.image[0];
      const extname = path.extname(imageFile.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);

      if (!isImage) {
        return res.status(400).json({ message: "Unsupported image type." });
      }
      if (!alt || alt.trim() === "") {
        return res
          .status(400)
          .json({ message: "Alt text is required for image." });
      }

      imageData =  {
                 filename: path.basename(imageFile.key), // "1756968423495-2.jpg"
                 filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageFile.key}` // keep "images/banners/..."
        }
    }

    // Handle icon upload
    if (req.files && req.files.mobile_image && req.files.mobile_image[0]) {
      const mobielImageFile = req.files.mobile_image[0];
      const extname = path.extname(mobielImageFile.originalname).toLowerCase();
      const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);

      if (!isImage) {
        return res.status(400).json({ message: "Unsupported icon type." });
      }
      if (!mobile_alt || mobile_alt.trim() === "") {
        return res
          .status(400)
          .json({ message: "Alt text is required for icon." });
      }

      mobileImageData =  {
                 filename: path.basename(mobielImageFile.key), // "1756968423495-2.jpg"
                 filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${mobielImageFile.key}` // keep "images/banners/..."
                }
    }

        const totalCSRBanners = await CSRBannerModel.countDocuments();
    
    const newCSRBanner = new CSRBannerModel({
      image: imageData ? [imageData] : [],
      alt,
      mobile_image: mobileImageData ? [mobileImageData] : [],
      mobile_alt,
      title,
      sequence: totalCSRBanners + 1,
    });

    await newCSRBanner.save();

    return res.status(201).json({
      message: "CSR Banner created successfully",
      newCSRBanner,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error creating CSR banner: ${error.message}` });
  }
}; 

const updateCSRBanner = async (req, res) => {
  try {
    const { title, alt, mobile_alt, sequence} = req.body;
    const bannerId = req.params._id;

    const existingBanner = await CSRBannerModel.findById(bannerId);
        if (!existingBanner) {
          return res.status(404).json({ message: "Banner not found." });
        }

    let updateData = {};

    if (req.files?.image?.[0]) {
      const file = req.files.image[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
        return res.status(400).json({ message: "Unsupported image type." });
      }

      updateData.image = [
        {
                         filename: path.basename(file.key), // "1756968423495-2.jpg"
                         filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "images/banners/..."
                        }
      ];
    }

    if (req.files?.mobile_image?.[0]) {
      const file = req.files.mobile_image[0];
      const extname = path.extname(file.originalname).toLowerCase();
      if (![".webp", ".jpg", ".jpeg", ".png"].includes(extname)) {
        return res.status(400).json({ message: "Unsupported icon type." });
      }
      updateData.mobile_image = [
        {
                         filename: path.basename(file.key), // "1756968423495-2.jpg"
                         filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "images/banners/..."
                        }
      ];
    }

    if (sequence && sequence !== existingBanner.sequence) {
  const banners = await CSRBannerModel.find().sort({ sequence: 1 });
  const maxSequence = banners.length;
  if (sequence > maxSequence) {
    return res.status(400).json({
      message: `Invalid sequence. The sequence cannot be greater than ${maxSequence}.`,
    });
  }

  const updateOperations = [];

  banners.forEach((t) => {
    if (t._id.toString() !== existingBanner._id.toString()) {
      if (sequence < existingBanner.sequence && t.sequence >= sequence && t.sequence < existingBanner.sequence) {
        updateOperations.push({
          updateOne: { filter: { _id: t._id }, update: { $inc: { sequence: 1 } } },
        });
      } else if (sequence > existingBanner.sequence && t.sequence <= sequence && t.sequence > existingBanner.sequence) {
        updateOperations.push({
          updateOne: { filter: { _id: t._id }, update: { $inc: { sequence: -1 } } },
        });
      }
    }
  });

  if (updateOperations.length > 0) {
    await CSRBannerModel.bulkWrite(updateOperations);
  }

  updateData.sequence = sequence; // <-- important
}

    // Add text fields (only if provided)
    if (alt !== undefined) updateData.alt = alt;
    if (mobile_alt !== undefined) updateData.mobile_alt = mobile_alt;
    if (title !== undefined) updateData.title = title;

    const updatedCSRBanner = await CSRBannerModel.findByIdAndUpdate(
      bannerId,
      { $set: updateData },
      { new: true }, 
      sequence,

    );

    if (!updatedCSRBanner) {
      return res.status(404).json({ message: "CSR Banner not found." });
    }

    return res.status(200).json({
      message: "CSR Banner updated successfully",
      updatedCSRBanner: updatedCSRBanner,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error updating CSR banner: ${error.message}`,
    });
  }
};

const getCSRBanner = async (req, res) => {
  try {
    const banner = await CSRBannerModel.findById(req.params._id);

    if (!banner) {
      return res.status(400).json({
        message: "No banner is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "CSR banner fetched successfully.",
      banner,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching CSR banner due to ${error.message}`,
    });
  }
};

const getCSRBanners = async (req, res) => {
  try {
    const banners = await CSRBannerModel.find().sort({sequence: 1});

    if (banners.length === 0) {
      return res.status(400).json({
        message: "No banners are created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "All CSR banners fetched successfully.",
      count: banners.length,
      banners,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching CSR banners due to ${error.message}`,
    });
  }
};

const deleteCSRBanner = async (req, res) => {
  try {
    const bannerExists = await CSRBannerModel.findById({
      _id: req.params._id,
    });

    if (bannerExists.length === 0) {
      return res.status(400).json({
        message: "No banners are created. Kindly create one.",
      });
    }

    const deletedSequence = bannerExists.sequence;

    const deletedCSRBanner = await CSRBannerModel.findOneAndDelete({
      _id: req.params._id,
    });

    if (!deletedCSRBanner) {
          return res.status(500).json({
            message: "Error in deleting the CSR banner.",
          });
        }

        const updateResult = await CSRBannerModel.updateMany(
                  { sequence: { $gt: deletedSequence } },
                  { $inc: { sequence: -1 } }
                );
        
        console.log(`Updated ${updateResult.modifiedCount} testimonial's seq.`);
    
    return res.status(200).json({
      message: "CSR banner deleted successfully.",
      deletedCSRBanner,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting CSR banner due to ${error.message}`,
    });
  }
};

module.exports = {
  createCSRBanner,
  updateCSRBanner,
  getCSRBanner,
  getCSRBanners,
  deleteCSRBanner
}

