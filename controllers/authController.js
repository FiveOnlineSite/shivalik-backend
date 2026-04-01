const authModel = require("../models/authModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const newUsername = username.toLowerCase().replace(/ /g, "");

    const user_name = await authModel.findOne({
      username: newUsername,
    });

    if (user_name) {
      return res.status(400).json({
        message: "Username already exists. Try with another username.",
      });
    }

    const user_email = await authModel.findOne({
      email,
    });

    if (user_email) {
      return res.status(400).json({
        message: "User email already exists. Try with another mail id.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password cannot be less than 8 characters.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashed_password = await bcrypt.hash(password, salt);

    const newUser = new authModel({
      username: newUsername,
      email,
      password: hashed_password,
      role,
    });

    // Access token
    const access_token = createAccessToken({
      id: newUser._id,
    });

    // Refresh token
    const refresh_token = createRefreshToken({
      id: newUser._id,
    });

    // Storing refresh token in cookie
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      path: "/api/auth/refresh_token",
      maxAge: 30 * 60 * 60 * 24 * 1000, // 2592000000ms i.e 30 days
    });

    await newUser.save();

    res.status(200).json({
      message: "User registered successfully.",
      newUser,
      access_token,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in creating user due to ${error.message}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authModel.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "User email doesn't exist. Please register first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Password does not match. Please try again.",
      });
    }

    // Access token
    const access_token = createAccessToken({
      id: user._id,
    });

    // Refresh token
    const refresh_token = createRefreshToken({
      id: user._id,
    });

    // Storing refresh token in cookie
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      path: "/api/auth/refresh_token",
      maxAge: 30 * 60 * 60 * 24 * 1000, // 2592000000ms i.e 30 days
    });

    res.status(200).json({
      message: "User logged in successfully.",
      access_token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error in login user due to ${error.message}`,
    });
  }
};

const logout = async (req, res) => {
  try {
    // Clearing the refresh token from cookie
    res.clearCookie("refresh_token", {
      path: "/api/auth/refresh_token",
    });

    // Response when successful
    return res.status(200).json({
      message: "User logged out successfully.",
    });
  } catch (error) {
    // Response when error
    return res.status(500).json({
      message: `Failed to logout the user. ${error.message}`,
    });
  }
};

// Creating access token again after login
const recreateAccessToken = async (req, res) => {
  try {
    // Taking refresh token from cookie
    const ref_token = req.cookies.refresh_token;

    // Checking refresh token
    if (!ref_token) {
      return res.status(400).json({
        message: "There is no refresh token. Please login now.",
      });
    }

    // Verify refresh token
    jwt.verify(ref_token, process.env.REFRESH_TOKEN, async (error, result) => {
      if (error) {
        return res.status(400).json({
          message: "Refresh token is invalid. Please login now.",
        });
      }

      // Check user
      const user = await userModel.findById(result.id);

      if (!user) {
        return res.status(400).json({
          message: "This user does not exist.",
        });
      }

      // Creating access token
      const access_token = createAccessToken({
        id: result.id,
      });

      // Response when successful
      return res.status(200).json({
        message: "Access token created successfully.",
        access_token,
      });
    });
  } catch (error) {
    // Response when error
    return res.status(400).json({
      message: `Failed to create access token. ${error.message}`,
    });
  }
};

const authUser = (req, res) => {
  res.status(200).json({
    message: "User is authenticated",
    valid: true,
  });
};

const authAdmin = (req, res) => {
  res.status(200).json({
    message: "Admin is authenticated",
    valid: true,
  });
};

// Creating access token
const createAccessToken = (payload) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN, {
    expiresIn: "1d",
  });

// Creating refresh token
const createRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN, {
    expiresIn: "30d",
  });

module.exports = {
  register,
  login,
  logout,
  recreateAccessToken,
  authAdmin,
  authUser,
};
