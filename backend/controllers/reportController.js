const Report = require("../models/Report");

// POST /api/reports
const createReport = async (req, res) => {
  try {
    const { houseId, reason } = req.body;

    const report = new Report({ houseId, reason });
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
    const reports = await Report.find().sort({ createdAt: -1 });
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

