const ContactResponseModel = require("../../models/contact/contactResponseModel");
const nodemailer = require("nodemailer"); 
const createContact = async (req, res, skipResponse = false) => {
  try {
    const { name, email, phone, message, page } = req.body;

    const newContact = new ContactResponseModel({
      name,
      email,
      phone,
      page,
      message,
    });

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, 
        },
      });

      await transporter.sendMail({
        from: `"Shivalik Contact" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER, // admin email
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

      console.log("Email sent successfully");

    } catch (mailError) {
      console.error("EMAIL ERROR:", mailError.message);
      // ❗ Don't fail API if email fails
    }

    await newContact.save();
    
    // ✅ Existing behavior preserved
    if (!skipResponse) {
      return res.status(200).json({
        message: "Added Contact content successfully.",
        newContact,
      });
    }

    return newContact;

  } catch (error) {
    console.error("CREATE CONTACT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save contact",
      error: error.message,
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await ContactResponseModel.find();

    if (contacts.length === 0) {
      return res.status(400).json({
        message: "No record found to fetch",
      });
    }

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
