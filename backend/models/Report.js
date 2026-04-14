const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  houseId: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);

