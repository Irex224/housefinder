const User = require("../models/User");
const House = require("../models/House");
const Inquiry = require("../models/Inquiry");
const Report = require("../models/Report");
const AgentApplication = require("../models/AgentApplication");
const SavedHouse = require("../models/SavedHouse");

const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAgents,
      verifiedAgents,
      totalHouses,
      verifiedListings,
      totalInquiries,
      totalReports,
      pendingApplications,
      totalAdmins,
      bannedUsers,
      suspendedAgents,
      totalSaved,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "agent" }),
      User.countDocuments({ role: "agent", isVerifiedAgent: true, isSuspended: false }),
      House.countDocuments(),
      House.countDocuments({ isVerified: true }),
      Inquiry.countDocuments(),
      Report.countDocuments(),
      AgentApplication.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "moderator" }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: "agent", isSuspended: true }),
      SavedHouse.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalAgents,
      verifiedAgents,
      totalHouses,
      verifiedListings,
      totalInquiries,
      totalReports,
      pendingApplications,
      totalAdmins,
      bannedUsers,
      suspendedAgents,
      totalSaved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

module.exports = { getAnalytics };
