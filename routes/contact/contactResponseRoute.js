const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const route = express.Router();
const ContactResponseController = require("../../controllers/contact/contactResponseController");

// 🔒 Validate ENV once at startup
function validateEnv() {
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER is missing in environment variables");
  }
  if (!process.env.SMTP_PASS) {
    throw new Error("SMTP_PASS is missing in environment variables");
  }
}

validateEnv();

route.post("/", async (req, res) => {
  try {
    const { name, email, phone, message, page } = req.body;

    // Save contact in DB
    const newContact = await ContactResponseController.createContact(req, res, true);

    // ✅ Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Verify SMTP connection before sending (VERY useful)
    await transporter.verify();

    const mailOptions = {
      from: `"Shivalik Contact" <${process.env.SMTP_USER}>`,
      to: "yatrik@fiveonline.in",
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

    // 🔥 Better error responses
    if (err.message.includes("SMTP_")) {
      return res.status(500).json({
        message: "Email configuration error",
        error: err.message,
      });
    }

    if (err.code === "EAUTH") {
      return res.status(500).json({
        message: "Email authentication failed. Check SMTP credentials.",
      });
    }

    if (err.code === "ECONNECTION") {
      return res.status(500).json({
        message: "SMTP connection failed. Server might be blocking the port.",
      });
    }

    return res.status(500).json({
      message: "Failed to save contact or send email testing",
      error: err.message,
    });
  }
});

// Get all contacts
route.get("/", ContactResponseController.getContacts);

module.exports = route;
