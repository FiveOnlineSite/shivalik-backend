const AwardsModel = require("../models/awardsRecognitionModel");
const path = require("path")

const createAward = async (req, res) => {
  try {
    const { alt } = req.body;
    if (!alt || !alt.trim()) {
      return res.status(400).json({ message: "Alt text is required." });
    }

    const totalAwards = await AwardsModel.countDocuments();

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

    const newAward = new AwardsModel({
      image: [imageData],
      alt,
      sequence: totalAwards + 1,
    });

    await newAward.save();

    res.status(201).json({
      message: "Award created successfully",
      award: newAward,
    });
  } catch (error) {
    res.status(500).json({ message: `Error creating award: ${error.message}` });
  }
};

const updateAward = async (req, res) => {
  try {
    const { alt, sequence } = req.body;
    const awardId = req.params._id;

    const existingAward = await AwardsModel.findById(awardId);
    if (!existingAward) {
      return res.status(404).json({ message: "Award not found" });
    }

    if (req.file) {
      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();

      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return res
          .status(400)
          .json({ message: `Unsupported file type: ${file.originalname}` });
      }

      existingAward.image = [
        {
          filename: path.basename(file.key),
          filepath: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`,
        },
      ];
    }

    if (alt !== undefined) {
      existingAward.alt = alt;
    }

    if (sequence && sequence !== existingAward.sequence) {
      const allAwards = await AwardsModel.find().sort({ sequence: 1 });
      const maxSequence = allAwards.length;

      if (sequence > maxSequence) {
        return res.status(400).json({
          message: `Invalid sequence. The sequence cannot be greater than ${maxSequence}.`,
        });
      }

      const updateOps = [];

      allAwards.forEach((a) => {
        if (a._id.toString() !== existingAward._id.toString()) {
          // Moving award UP
          if (a.sequence >= sequence && a.sequence < existingAward.sequence) {
            updateOps.push({
              updateOne: { filter: { _id: a._id }, update: { $inc: { sequence: 1 } } },
            });
          }
          // Moving award DOWN
          else if (a.sequence > existingAward.sequence && a.sequence <= sequence) {
            updateOps.push({
              updateOne: { filter: { _id: a._id }, update: { $inc: { sequence: -1 } } },
            });
          }
        }
      });

      if (updateOps.length > 0) {
        await AwardsModel.bulkWrite(updateOps);
      }

      existingAward.sequence = sequence;
    }

    await existingAward.save();

    res.status(200).json({
      message: "Award updated successfully",
      updatedAward: existingAward,
    });
  } catch (error) {
    res.status(500).json({ message: `Error updating award: ${error.message}` });
  }
};


const getAward = async (req, res) => {
  try {
    const award = await AwardsModel.findById(req.params._id)

    if (!award) {
      return res.status(404).json({ message: "Award not found" });
    }

    return res.status(200).json({
      message: "Award fetched successfully.",
      award: award,
    });
  } catch (error) {
    console.error("Error fetching award:", error);
    return res.status(500).json({
      message: `Error in fetching award due to ${error.message}`,
    });
  }
};

const getAwards = async (req, res) => {
  try {
    const awards = await AwardsModel.find().sort({sequence: 1})

    if (!awards.length) {
      return res.status(400).json({ message: "No awards found" });
    }

    return res.status(200).json({
      message: "awards fetched successfully.",
      awardsCount: awards.length,
      awards,
      
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error fetching awards: ${error.message}`,
    });
  }
};

const deleteAward = async (req, res) => {
  try {
    const { _id } = req.params;

    const award = await AwardsModel.findById(_id);
    if (!award) {
      return res.status(404).json({ message: "Product not found" });
    }
   
    const deletedSequence = award.sequence;

    const deletedAward = await AwardsModel.findByIdAndDelete(req.params._id);

    if (!deletedAward) {
      return res.status(500).json({
        message: "Error in deleting the award.",
      });
    }

    const updateResult = await AwardsModel.updateMany(
      { sequence: { $gt: deletedSequence } },
      { $inc: { sequence: -1 } }
    );

    console.log(`Updated ${updateResult.modifiedCount} award's order.`);

    return res.status(200).json({
      message: "Award deleted successfully.",
      deletedAward,
    });

  } catch (error) {
    return res.status(500).json({ message: `Error in deleting award: ${error.message}` });
  }
};

module.exports = {
  createAward,
  updateAward,
  getAward,
  getAwards,
  deleteAward,
};
