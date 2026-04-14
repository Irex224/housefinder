const AgentApplication = require("../models/AgentApplication");
const House = require("../models/House");

// POST /api/agents/apply
const applyAgent = async (req, res) => {
  try {
    const { name, email, phone, experience, area } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email and phone are required." });
    }

    const application = new AgentApplication({
      name,
      email,
      phone,
      experience,
      area,
      status: "pending",
    });

    const savedApplication = await application.save();
    return res.status(201).json(savedApplication);
  } catch (err) {
    console.error("Error creating agent application:", err);
    return res.status(500).json({ message: "Failed to submit application.", error: err.message });
  }
};

// GET /api/agents/applications
const getApplications = async (req, res) => {
  try {
    const applications = await AgentApplication.find().sort({ createdAt: -1 });
    return res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch applications.", error: err.message });
  }
};

// PUT /api/agents/:id/approve
// Also supports existing PATCH /api/agents/applications/:id (backwards compatibility)
const approveAgent = async (req, res) => {
  try {
    const status = req.body.status || "approved";

    const updated = await AgentApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Trust & safety: when an agent is approved, mark their listings as verified.
    // Since houses are not directly linked to agent IDs in this codebase, we match by `area`
    // against the house `location` (case-insensitive substring).
    if (status === "approved" && updated.area) {
      const escapeRegExp = (str) =>
        String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const areaRegex = new RegExp(escapeRegExp(updated.area), "i");

      await House.updateMany(
        { location: areaRegex },
        { $set: { isVerified: true } }
      );
    }

    return res.json(updated);
  } catch (err) {
    console.error("Error updating application status:", err);
    return res
      .status(500)
      .json({ message: "Failed to update application.", error: err.message });
  }
};

module.exports = {
  applyAgent,
  getApplications,
  approveAgent,
};

