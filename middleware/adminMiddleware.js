const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access token is missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    // console.log(process.env.ACCESS_TOKEN);

    const user = await authModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Access token has expired. Kindly login again." });
    }
    return res
      .status(500)
      .json({ message: `Admin authentication failed due to ${error.message}` });
  }
};

module.exports = authenticateAdmin;
