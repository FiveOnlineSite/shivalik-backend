const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const route = express.Router();
const ContactResponseController = require("../../controllers/contact/contactResponseController");

route.post("/", async (req, res) => {
  try {
    // Save contact in DB
    const newContact = await ContactResponseController.createContact(req, res, true);

    // ✅ Gmail transporter (use App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App Password (not Gmail password)
      },
    });

    const { name, email, phone, message, page } = req.body;

    // Optional debug (remove in production)
    console.log("SMTP USER:", process.env.SMTP_USER ? "Loaded" : "Missing");
    console.log("SMTP PASS:", process.env.SMTP_PASS ? "Loaded" : "Missing");

    const mailOptions = {
      from: "Shivalik Contact",
      to: "mansi.fiveonline@gmail.com",
      subject: "Shivalik Contact Form Submission",
      html: `
        <h3>Shivalik Contact Request</h3>
        <p><strong>Name:</strong> ${name || "-"}</p>
        <p><strong>Email:</strong> ${email || "-"}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Message:</strong> ${message || "-"}</p>
        <p><strong>Page:</strong> ${page || "-"}</p>
      `,
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Contact saved and email sent successfully",
      newContact,
    });
  } catch (err) {
    console.error("Error processing contact form:", err);

    return res.status(500).json({
      message: "Failed to save contact or send email",
      error: err.message,
    });
  }
});

// Get all contacts
route.get("/", ContactResponseController.getContacts);

module.exports = route;