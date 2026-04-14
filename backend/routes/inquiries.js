const express = require("express");
const Inquiry = require("../models/Inquiry");

const router = express.Router();

// Create a new inquiry
router.post("/", async (req, res) => {
  try {
    const { houseId, name, email, message } = req.body;

    if (!houseId || !name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const inquiry = new Inquiry({
      houseId,
      name,
      email,
      message,
    });

    const savedInquiry = await inquiry.save();
    res.status(201).json(savedInquiry);
  } catch (err) {
    console.error("Error creating inquiry:", err);
    res.status(500).json({ message: "Failed to create inquiry." });
  }
});

// Get all inquiries (for future admin/agent views)
router.get("/", async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error("Error fetching inquiries:", err);
    res.status(500).json({ message: "Failed to fetch inquiries." });
  }
});

module.exports = router;

