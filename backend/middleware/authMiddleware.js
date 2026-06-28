const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      if (req.user.isBanned) {
        return res.status(403).json({ message: "Your account has been banned" });
      }

      return next();
    } catch (err) {
      console.error("Auth middleware error:", err);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

exports.optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch {
      req.user = null;
    }
  }
  next();
};

exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

exports.requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!["moderator", "superadmin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

exports.requireAgent = (req, res, next) => {
  if (req.user?.role !== "agent") {
    return res.status(403).json({ message: "Agent access required" });
  }
  if (req.user.isSuspended) {
    return res.status(403).json({ message: "Your agent account is suspended" });
  }
  if (!req.user.isVerifiedAgent) {
    return res.status(403).json({ message: "You must be a verified agent" });
  }
  next();
};
