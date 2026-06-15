const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const connectDb = async (req, res) => {
  mongoose
    .connect(process.env.MONGO_DB_URL)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((error) => {
      console.log(`Database connection failed due to ${error}`);
    });
};

module.exports = connectDb;
