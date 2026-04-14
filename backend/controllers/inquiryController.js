const Inquiry = require("../models/Inquiry");

// POST /api/inquiries
const createInquiry = async (req, res) => {
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
    return res.status(201).json(savedInquiry);
  } catch (err) {
    console.error("Error creating inquiry:", err);
    return res
      .status(500)
      .json({ message: "Failed to create inquiry.", error: err.message });
  }
};

// GET /api/inquiries
const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return res.json(inquiries);
  } catch (err) {
    console.error("Error fetching inquiries:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch inquiries.", error: err.message });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
};

