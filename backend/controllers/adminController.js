const User = require("../models/User");
const House = require("../models/House");
const Inquiry = require("../models/Inquiry");
const Report = require("../models/Report");
const AgentApplication = require("../models/AgentApplication");
const { ROLES } = require("../utils/roles");

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerifiedAgent: user.isVerifiedAgent || false,
  isSuspended: user.isSuspended || false,
  isBanned: user.isBanned || false,
  area: user.area || "",
  createdAt: user.createdAt,
});

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users.map(formatUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// PUT /api/admin/users/:id/ban
const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === ROLES.SUPERADMIN) {
      return res.status(403).json({ error: "Cannot ban a super admin" });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ error: "Cannot ban yourself" });
    }

    user.isBanned = true;
    await user.save();
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to ban user" });
  }
};

// PUT /api/admin/users/:id/unban
const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBanned = false;
    await user.save();
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unban user" });
  }
};

// POST /api/admin/admins — promote existing user to admin (moderator)
const createAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found. They must sign up first." });
    }
    if (user.role === ROLES.SUPERADMIN) {
      return res.status(400).json({ error: "User is already super admin" });
    }

    user.role = ROLES.ADMIN;
    await user.save();
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create admin" });
  }
};

// DELETE /api/admin/admins/:id — demote admin to regular user
const removeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === ROLES.SUPERADMIN) {
      return res.status(403).json({ error: "Cannot remove super admin" });
    }
    if (user.role !== ROLES.ADMIN) {
      return res.status(400).json({ error: "User is not an admin" });
    }

    user.role = ROLES.USER;
    await user.save();
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove admin" });
  }
};

// PUT /api/admin/agents/:id/suspend
const suspendAgent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== ROLES.AGENT) {
      return res.status(400).json({ error: "User is not an agent" });
    }

    user.isSuspended = true;
    await user.save();

    await House.updateMany(
      { agentId: user._id },
      { $set: { isVerified: false } }
    );

    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to suspend agent" });
  }
};

// PUT /api/admin/agents/:id/unsuspend
const unsuspendAgent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== ROLES.AGENT) {
      return res.status(400).json({ error: "User is not an agent" });
    }

    user.isSuspended = false;
    if (user.isVerifiedAgent) {
      await House.updateMany(
        { agentId: user._id },
        { $set: { isVerified: true } }
      );
    }
    await user.save();

    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unsuspend agent" });
  }
};

module.exports = {
  getUsers,
  banUser,
  unbanUser,
  createAdmin,
  removeAdmin,
  suspendAgent,
  unsuspendAgent,
  formatUser,
};
