const express = require("express");
const { createReport, getReports } = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createReport);

router.get(
  "/",
  protect,
  authorize("moderator", "superadmin"),
  getReports
);

module.exports = router;
