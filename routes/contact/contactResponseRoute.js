const express = require("express");
const route = express.Router();

const ContactResponseController = require("../../controllers/contact/contactResponseController");

route.post("/", ContactResponseController.createContact);
route.get("/", ContactResponseController.getContacts);
route.delete("/:_id", ContactResponseController.deleteContact);

module.exports = route;