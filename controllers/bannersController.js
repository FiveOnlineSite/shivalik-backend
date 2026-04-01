const BannerModel = require("../models/bannersModel")
const path = require("path")

const createBanner = async (req, res) => {

  try {
    const { title, alt, mobile_alt, page } = req.body;

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

     const existingPage = await BannerModel.findOne({ page: page.trim() });
    if (existingPage)
      return res
        .status(400)
        .json({ message: "Banner already exists for this page" });

    const newBanner = new BannerModel({
      image: imageData ? [imageData] : [],
      alt,
      mobile_image: mobileImageData ? [mobileImageData] : [],
      mobile_alt,
      title,
      page
    });

    await newBanner.save();

    return res.status(201).json({
      message: "Banner created successfully",
      newBanner,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error creating banner: ${error.message}` });
  }
}; 

const updateBanner = async (req, res) => {
  try {
    const { title, alt, mobile_alt, page} = req.body;
    const bannerId = req.params._id;

    const existingBanner = await BannerModel.findById(req.params._id);

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

    let updatedPage = existingBanner.page;

    if (page && page !== existingBanner.page) {
      const conflictingBanner = await BannerModel.findOne({ page });

      if (conflictingBanner) {
        // Swap pages
        await BannerModel.findByIdAndUpdate(conflictingBanner._id, {
          page: existingBanner.page,
        });

        updatedPage = page; // Assign the new page to the current banner
      } else {
        // No conflict, update page normally
        updatedPage = page;
      }
    }


    // Add text fields (only if provided)
    if (alt !== undefined) updateData.alt = alt;
    if (mobile_alt !== undefined) updateData.mobile_alt = mobile_alt;
    if (title !== undefined) updateData.title = title;
    if (page !== undefined) updateData.page = updatedPage

    const updatedBanner = await BannerModel.findByIdAndUpdate(
      bannerId,
      { $set: updateData },
      { new: true } // return updated doc
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found." });
    }

    return res.status(200).json({
      message: "Banner updated successfully",
      updatedBanner: updatedBanner,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error updating banner: ${error.message}`,
    });
  }
};


const getBannerByPage = async (req, res) => {
  try {
     let page = req.params.page;   

    if (!page.startsWith("/")) page = `/${page}`;

    const banner = await BannerModel.findOne({ page });

    if (!banner) {
      return res.status(404).json({ message: "No banner found for this page" });
    }

    res.status(200).json({ banner });
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};


const getPagesForBanner = async (req, res) => {
  try {
    const vinylApps = await VinylApplicationModel.find().select("name");
    const coatedApps = await CoatedApplicationModel.find().select("name");
    const seatingApps = await SeatingApplicationModel.find().select("name");
    const vinylProducts = await VinylProductModel.find().select("name");

    const slugify = (str) => {
      if (!str || typeof str !== "string") return "";
      return str
        .toLowerCase()
    .trim()
    .replace(/&/g, "and")         // replace &
    .replace(/\//g, "-")          // replace /
    .replace(/[^a-z0-9]+/g, "-")  // non-alphanumeric → -
    .replace(/^-+|-+$/g, ""); 
    };

    const safePage = (label, url) => ({
      label: label || "Untitled Page",
      url: url && typeof url === "string" && url.trim() !== "" ? url : "#",
    });

    const vinylPages = vinylApps
      .filter(app => app?.name)
      .map(app =>
        safePage(
          `Vinyl Application - ${app.name}`,
          `/vinyl-flooring/applications/${slugify(app.name)}`
        )
      );

    const coatedPages = coatedApps
      .filter(app => app?.name)
      .map(app =>
        safePage(
          `Coated Application - ${app.name}`,
          `/coated-fabrics/applications/${slugify(app.name)}`
        )
      );

    const seatingPages = seatingApps
      .filter(app => app?.name)
      .map(app =>
        safePage(
          `Seating Application - ${app.name}`,
          `/seating-components/applications/${slugify(app.name)}`
        )
      );

    const vinylProductPages = vinylProducts
      .filter(prod => prod?.name)
      .map(prod =>
        safePage(
          `Vinyl Product - ${prod.name}`,
          prod.name === "LVT"
            ? "/lvt-flooring"
            : `/vinyl-flooring/products/${slugify(prod.name)}`
        )
      );

    const pages = [
      ...vinylPages,
      ...coatedPages,
      ...seatingPages,
      ...vinylProductPages,
    ];

    res.status(200).json({
      message: "Pages fetched succesfully",
      pages
    });
  } catch (error) {
    console.error("Error in getPagesForBanner:", error);
    res
      .status(500)
      .json({ message: "Error fetching pages", error: error.message });
  }
};


const getBanner = async (req, res) => {
  try {
    const banner = await BannerModel.findById(req.params._id);

    if (!banner) {
      return res.status(400).json({
        message: "No banner is created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "Banner fetched successfully.",
      banner,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching banner due to ${error.message}`,
    });
  }
};

const getBanners = async (req, res) => {
  try {
    const banners = await BannerModel.find();

    if (banners.length === 0) {
      return res.status(400).json({
        message: "No banners are created. Kindly create one.",
      });
    }
    return res.status(200).json({
      message: "All banners fetched successfully.",
      count: banners.length,
      banners,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching banners due to ${error.message}`,
    });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const bannerExists = await BannerModel.findById({
      _id: req.params._id,
    });

    if (bannerExists.length === 0) {
      return res.status(400).json({
        message: "No banners are created. Kindly create one.",
      });
    }

    const deletedBanner = await BannerModel.findOneAndDelete({
      _id: req.params._id,
    });

    return res.status(200).json({
      message: "Banner deleted successfully.",
      deletedBanner,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting banner due to ${error.message}`,
    });
  }
};


module.exports = {
  createBanner,
  updateBanner,
  getBannerByPage,
  getPagesForBanner,
  getBanner,
  getBanners,
  deleteBanner
}

