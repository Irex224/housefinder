const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { SUPER_ADMIN_EMAIL } = require("../utils/roles");
const { formatUser } = require("../controllers/adminController");

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user",
    });
    await newUser.save();

    const token = signToken(newUser);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: formatUser(newUser),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "Your account has been banned" });
    }

    if (normalizedEmail === SUPER_ADMIN_EMAIL && user.role !== "superadmin") {
      user.role = "superadmin";
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// GET /api/auth/profile
router.get("/profile", protect, async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });
    res.json(formatUser(req.user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

module.exports = router;
