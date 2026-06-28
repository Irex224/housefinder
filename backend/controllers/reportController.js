const Report = require("../models/Report");
const House = require("../models/House");

// POST /api/reports
const createReport = async (req, res) => {
  try {
    const { houseId, reason } = req.body;

    if (!houseId || !reason?.trim()) {
      return res
        .status(400)
        .json({ error: "House ID and reason are required" });
    }

    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ error: "House not found" });
    }

    const report = new Report({ houseId, reason: reason.trim() });
    await report.save();

    return res.status(201).json({ message: "Report submitted" });
  } catch (err) {
    console.error("Error creating report:", err);
    return res.status(500).json({ error: "Failed to submit report" });
  }
};

// GET /api/reports (admin use)
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("houseId", "location price")
      .sort({ createdAt: -1 });
    return res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    return res.status(500).json({ error: "Failed to fetch reports" });
  }
};

module.exports = {
  createReport,
  getReports,
};
