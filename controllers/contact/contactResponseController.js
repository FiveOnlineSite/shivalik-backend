const ContactResponseModel = require("../../models/contact/contactResponseModel");

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

    if (!skipResponse) {
      return res.status(200).json({
        message: "Added Contact content successfully.",
        newContact,
      });
    }
    
    await newContact.save();

    return newContact; // return saved document if skipping response


  }catch (error) {
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