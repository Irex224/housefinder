// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "agent", "moderator", "superadmin"],
    default: "user",
  },
  isVerifiedAgent: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  phone: { type: String, default: "" },
  area: { type: String, default: "" },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
