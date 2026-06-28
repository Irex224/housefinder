const Inquiry = require("../models/Inquiry");
const House = require("../models/House");
const { isAdmin, isAgent } = require("../utils/roles");

const createInquiry = async (req, res) => {
  try {
    const { houseId, name, email, message } = req.body;

    if (!houseId || !name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: "House not found." });
    }

    const inquiry = new Inquiry({ houseId, name, email, message });
    const savedInquiry = await inquiry.save();
    return res.status(201).json(savedInquiry);
  } catch (err) {
    console.error("Error creating inquiry:", err);
    return res
      .status(500)
      .json({ message: "Failed to create inquiry.", error: err.message });
  }
};

const getInquiries = async (req, res) => {
  try {
    let inquiries;

    if (isAdmin(req.user)) {
      inquiries = await Inquiry.find()
        .populate("houseId", "location price agentId")
        .sort({ createdAt: -1 });
    } else if (isAgent(req.user)) {
      const myHouses = await House.find({ agentId: req.user._id }).select("_id");
      const houseIds = myHouses.map((h) => h._id);
      inquiries = await Inquiry.find({ houseId: { $in: houseIds } })
        .populate("houseId", "location price")
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

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
