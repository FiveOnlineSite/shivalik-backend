
const express = require("express");
const nodemailer = require("nodemailer");
const route = express.Router();
const ContactResponseController = require("../../controllers/contact/contactResponseController")

route.post("/", async (req, res) => {
  try {
    // Save contact in DB
    const newContact = await ContactResponseController.createContact(req, res, true);

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
secure: false,
tls: {
  rejectUnauthorized: false
},
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const { name, email, phone, message, page } = req.body;

    const mailOptions = {
      from: `"Shivalik Contact" <${process.env.SMTP_USER}>`,
      to: "mansi.fiveonline@gmail.com",
      subject: "Shivalik Contact Form Submission",
      html: `
        <h3>Shivalik Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Page:</strong> ${page}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Contact saved and email sent successfully",
      newContact,
    });
  } catch (err) {
    console.error("Error processing contact form:", err);
    res.status(500).json({
      message: "Failed to save contact or send email",
      error: err.message,
    });
  }
});


route.get("/", ContactResponseController.getContacts )

module.exports = route;
