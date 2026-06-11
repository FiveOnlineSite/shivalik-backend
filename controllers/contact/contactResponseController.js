const ContactResponseModel = require("../../models/contact/contactResponseModel");
const nodemailer = require("nodemailer");

const createContact = async (req, res) => {
  try {
    const { name, email, phone, message, page } = req.body;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        message: "SMTP credentials are missing in environment variables",
      });
    }

    const newContact = await ContactResponseModel.create({
      name,
      email,
      phone,
      page,
      message,
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Shivalik Contact" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      // cc: process.env.CC_EMAIL || "",
      replyTo: email,
      subject: "Shivalik Contact Form Submission",
      html: `
        <h3>Shivalik Contact Request</h3>
        <p><strong>Name:</strong> ${name || "-"}</p>
        <p><strong>Email:</strong> ${email || "-"}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Message:</strong> ${message || "-"}</p>
        <p><strong>Page:</strong> ${page || "-"}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Contact saved and email sent successfully",
      newContact,
    });

  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Contact saved/mail process failed",
      error: error.message,
      code: error.code || null,
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await ContactResponseModel.find();

    res.status(200).json({
      message: "Contacts retrieved successfully.",
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error in fetching contacts: ${error.message}`,
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contactId = req.params._id;

    const contact = await ContactResponseModel.findById(contactId);

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found.",
      });
    }

    await ContactResponseModel.findByIdAndDelete(contactId);

    res.status(200).json({
      message: "Contact deleted successfully.",
      deletedContact: contact,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error in deleting contact: ${error.message}`,
    });
  }
};

module.exports = {
  createContact,
  getContacts,
  deleteContact,
};