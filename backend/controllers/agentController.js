const AgentApplication = require("../models/AgentApplication");
const House = require("../models/House");
const User = require("../models/User");

const verifyAgentListings = async (userId, area) => {
  await House.updateMany({ agentId: userId }, { $set: { isVerified: true } });

  if (area) {
    const escapeRegExp = (str) =>
      String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const areaRegex = new RegExp(escapeRegExp(area), "i");

    await House.updateMany(
      { location: areaRegex, agentId: null },
      { $set: { agentId: userId, isVerified: true } }
    );
  }
};

const revokeAgentListings = async (userId) => {
  await House.updateMany(
    { agentId: userId },
    { $set: { isVerified: false } }
  );
};

// POST /api/agents/apply
const applyAgent = async (req, res) => {
  try {
    const { name, email, phone, experience, area } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Name, email and phone are required." });
    }

    const existingPending = await AgentApplication.findOne({
      email: email.toLowerCase(),
      status: "pending",
    });
    if (existingPending) {
      return res.status(400).json({
        message: "You already have a pending application.",
      });
    }

    const application = new AgentApplication({
      name,
      email: email.toLowerCase(),
      phone,
      experience,
      area,
      status: "pending",
      userId: req.user ? req.user._id : null,
    });

    const savedApplication = await application.save();
    return res.status(201).json(savedApplication);
  } catch (err) {
    console.error("Error creating agent application:", err);
    return res.status(500).json({
      message: "Failed to submit application.",
      error: err.message,
    });
  }
};

// GET /api/agents/applications
const getApplications = async (req, res) => {
  try {
    const applications = await AgentApplication.find().sort({ createdAt: -1 });
    return res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    return res.status(500).json({
      message: "Failed to fetch applications.",
      error: err.message,
    });
  }
};

// PUT /api/agents/:id/approve
const approveAgent = async (req, res) => {
  try {
    const status = req.body.status || "approved";

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updated = await AgentApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found." });
    }

    let user = await User.findOne({ email: updated.email });

    if (status === "approved") {
      if (user) {
        user.role = "agent";
        user.isVerifiedAgent = true;
        user.phone = updated.phone || user.phone;
        user.area = updated.area || user.area;
        await user.save();
      }

      if (user) {
        await verifyAgentListings(user._id, updated.area);
      } else if (updated.area) {
        const escapeRegExp = (str) =>
          String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const areaRegex = new RegExp(escapeRegExp(updated.area), "i");
        await House.updateMany(
          { location: areaRegex },
          { $set: { isVerified: true } }
        );
      }
    } else if (status === "rejected" && user) {
      user.isVerifiedAgent = false;
      if (user.role === "agent") {
        user.role = "user";
      }
      await user.save();
      await revokeAgentListings(user._id);
    }

    return res.json(updated);
  } catch (err) {
    console.error("Error updating application status:", err);
    return res.status(500).json({
      message: "Failed to update application.",
      error: err.message,
    });
  }
};

module.exports = {
  applyAgent,
  getApplications,
  approveAgent,
};
