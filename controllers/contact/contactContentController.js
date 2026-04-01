const ContactContentModel = require("../../models/contact/contactContentModel");
const mongoose = require("mongoose");
const path = require("path");

const createContactContent = async (req, res) => {
  try {
    const { phone_number, emails, office_address, map_link} = req.body;

    const ContactContentData = JSON.parse(req.body.social_media);

    const files = req.files;
    if (!Array.isArray(ContactContentData) || ContactContentData.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one social media is required." });
    }

    if (!files || files.length !== ContactContentData.length) {
      return res
        .status(400)
        .json({ message: "Each social media must have a corresponding icon." });
    }

    const uploadedContactContent = [];

    const MAX_FILE_SIZE = 500 * 1024;

    for (let i = 0; i < ContactContentData.length; i++) {
      const socialMedia = ContactContentData[i];
      const file = files[i];

      const ext = path.extname(file.originalname).toLowerCase();
      const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
      if (!isImage) {
        return res.status(400).json({
          message: `Unsupported file type for icon: ${file.originalname}`,
        });
      }

      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          message: `File size exceeds 500KB for ${file.originalname}`,
        });
      }

      uploadedContactContent.push({
        icon: [
         {
           filename: path.basename(file.key),
           filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}` // keep "images/banners/..."
          }
        ],
        alt: socialMedia.alt,
        link: socialMedia.link
      });
    }

    const newContactContent = new ContactContentModel({
        phone_number,
        emails,
        office_address,
        map_link,
      social_media: uploadedContactContent,
    });

    await newContactContent.save();

    res.status(201).json({
      message: "Contact Content created successfully",
      newContactContent,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error in creating Contact Content: ${error.message}`,
    });
  }
};

const updateContactContent = async (req, res) => {
  try {
    const { phone_number, emails, office_address, map_link } = req.body;

    // Parse social_media JSON (if sent)
    let ContactContentData = [];
    if (req.body.social_media && req.body.social_media !== "undefined") {
      ContactContentData = JSON.parse(req.body.social_media);
    }

    // Build a map of uploaded files (if any)
    const files = req.files || [];
    const fileMap = {};
    for (const file of files) {
      fileMap[file.fieldname] = file;
    }

    const currentContactContent = await ContactContentModel.findOne({});
    if (!currentContactContent) {
      return res.status(404).json({ message: "ContactContent not found." });
    }

    const uploadedContactContent = []; // new social media objects
    const modifiedContactContent = []; // changed ones

    const MAX_FILE_SIZE = 500 * 1024; // 500 KB

    for (let i = 0; i < ContactContentData.length; i++) {
      const socialMedia = ContactContentData[i];

      // File can be identified by `icon_${index}` or similar
      const fileFieldName = `icon_${i}`;
      const file = fileMap[fileFieldName];

      let iconData = [];

      if (file) {
        const extname = path.extname(file.originalname).toLowerCase();
        const isImage = [".webp", ".jpg", ".jpeg", ".png"].includes(extname);
        if (!isImage) {
          return res
            .status(400)
            .json({ message: `Unsupported image type: ${file.originalname}` });
        }

        if (file.size > MAX_FILE_SIZE) {
          return res
            .status(400)
            .json({ message: `File size exceeds 500KB for ${file.originalname}` });
        }

        iconData = [
          {
            filename: path.basename(file.key),
            filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
          },
        ];
      }

      // If this socialMedia already exists (has _id), update it
      if (socialMedia._id) {
        const existingIndex = currentContactContent.social_media.findIndex(
          (sm) => sm._id.toString() === socialMedia._id
        );

        if (existingIndex !== -1) {
          const existingItem = currentContactContent.social_media[existingIndex];
          currentContactContent.social_media[existingIndex] = {
            ...existingItem,
            alt: socialMedia.alt,
            link: socialMedia.link,

            icon: iconData.length > 0 ? iconData : existingItem.icon,
          };
          modifiedContactContent.push(currentContactContent.social_media[existingIndex]);
        }
      } else {
        // It's a new social media item
        uploadedContactContent.push({
          alt: socialMedia.alt || "",
          icon: iconData,
          link: socialMedia.link || ""
        });
      }
    }

    const updatedFields = {
      phone_number,
      emails,
      office_address,
      map_link,
      social_media: [...currentContactContent.social_media, ...uploadedContactContent],
    };

    const updatedContactContent = await ContactContentModel.findByIdAndUpdate(
      currentContactContent._id,
      updatedFields,
      { new: true }
    );

    return res.status(200).json({
      message: "ContactContent updated successfully.",
      modifiedContactContent,
      updatedContactContent,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in updating ContactContent: ${error.message || error}`,
    });
  }
};

const getSocialMedia = async (req, res) => {
  try {
    const { socialMediaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(socialMediaId)) {
      return res.status(400).json({ message: "Invalid socialMediaId" });
    }

    const socialMedia = await ContactContentModel.findOne({
      "social_media._id": new mongoose.Types.ObjectId(socialMediaId),
    });

    if (!socialMedia) {
      return res.status(404).json({
        message: "ContactContent not found in any ContactContent document.",
      });
    }

    const matchedSocialMedia = socialMedia.social_media.find((s) => s._id.toString() === socialMediaId);

    if (!matchedSocialMedia) {
      return res.status(404).json({ message: "social media not found in array." });
    }

    return res.status(200).json({
      message: "socialMedia fetched successfully.",
      socialMedia: matchedSocialMedia,
      // parentContactContentId: ContactContent._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching socialMedia due to ${error.message}`,
    });
  }
};

const getContactContent = async (req, res) => {
  try {
    const ContactContents = await ContactContentModel.find();

    if (ContactContents.length === 0) {
      return res.status(400).json({
        message: "ContactContent not added. Kindly add one.",
      });
    }

    const totalContactContents = ContactContents.reduce(
      (acc, doc) => acc + (doc.ContactContent?.length || 0),
      0
    );

    return res.status(200).json({
      message: "ContactContents fetched successfully.",
      ContactContentCount: totalContactContents,
      ContactContents,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in fetching ContactContents due to ${error.message}`,
    });
  }
};

const deleteSocialMedia = async (req, res) => {
  try {
    const { socialMediaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(socialMediaId)) {
      return res.status(400).json({ message: "Invalid socialMediaId" });
    }

    const socialMedia = await ContactContentModel.findOne({
      "social_media._id": socialMediaId,
    });

    if (!socialMedia) {
      return res.status(404).json({
        message: "socialMedia not found in any ContactContent.",
      });
    }

    const deletedSocialMedia = socialMedia.social_media.find((a) => a._id.toString() === socialMediaId);

    if (!deletedSocialMedia) {
      return res.status(404).json({
        message: "socialMedia not found in the array.",
      });
    }

    const updatedSocialMedia = await ContactContentModel.findByIdAndUpdate(
      socialMedia._id,
      {
        $pull: { socialMedia: { _id: socialMediaId } },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "socialMedia deleted successfully.",
      deletedSocialMedia,
      updatedSocialMedia,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error deleting socialMedia from ContactContent: ${error.message}`,
    });
  }
};

const deleteContactContent = async (req, res) => {
  try {
    const ContactContent = await ContactContentModel.findOne({});

    if (ContactContent.length === 0) {
      return res.status(400).json({
        message: "No ContactContent added to delete. Kindly add one.",
      });
    }

    const deletedContactContent = await ContactContentModel.findByIdAndDelete(ContactContent._id);

    return res.status(200).json({
      message: "ContactContent deleted successfully.",
      deletedContactContent,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in deleting ContactContent due to ${error.message}`,
    });
  }
};

module.exports = {
  createContactContent,
  updateContactContent,
  getSocialMedia,
  getContactContent,
  deleteSocialMedia,
  deleteContactContent,
};
