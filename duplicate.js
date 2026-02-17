const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FAQModel = require("./models/projectDetails/faqModel"); // adjust path

dotenv.config();

const sourceProjectId = "68d38ba315a992924a54ca9b"; // project to copy from
const targetProjectId = "68d384d475061a5dc94760a9"; // project to copy to

// Map certain questions that need special HTML formatting
const htmlFormattingMap = {
  "Which documents we have to submit?": `<ul class="fa-ul" style="font-family:'Lato'; font-size:15px; color:#d6d6d6; letter-spacing:1px;line-height:24px; padding-bottom:20px;">
<li><i class="fa-li fa fa-check" aria-hidden="true" style="color:#ee7400;"></i>PAN</li>
<li><i class="fa-li fa fa-check" aria-hidden="true" style="color:#ee7400;"></i>AADHAR</li>
<li><i class="fa-li fa fa-check" aria-hidden="true" style="color:#ee7400;"></i>Photographs</li>
</ul>`
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("✅ Connected to MongoDB");

    // 1️⃣ Fetch all FAQs of the source project in insertion order
    const sourceFAQs = await FAQModel.find({ project: sourceProjectId }).sort({ _id: 1 });

    if (!sourceFAQs.length) {
      console.log("❌ No FAQs found for the source project.");
      return mongoose.connection.close();
    }

    // 2️⃣ Duplicate each FAQ with the new project ID and wrap answer in <p>
    const duplicatedFAQs = sourceFAQs.map(faq => {
      const obj = faq.toObject();
      delete obj._id; // remove old _id
      obj.project = targetProjectId; // set new project id

      // Wrap answer in <p> unless special HTML is defined
      obj.answer = htmlFormattingMap[obj.question] || `<p>${obj.answer}</p>`;

      return obj;
    });

    // 3️⃣ Insert duplicated FAQs into MongoDB
    await FAQModel.insertMany(duplicatedFAQs);

    console.log(`✅ Duplicated ${duplicatedFAQs.length} FAQs to project ${targetProjectId} with proper HTML formatting`);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error duplicating FAQs:", error);
    mongoose.connection.close();
  }
})();
