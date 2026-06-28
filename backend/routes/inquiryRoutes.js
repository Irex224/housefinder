const express = require("express");
const {
  createInquiry,
  getInquiries,
} = require("../controllers/inquiryController");
const { protect, requireAdmin, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createInquiry);

router.get(
  "/",
  protect,
  authorize("agent", "moderator", "superadmin"),
  getInquiries
);

module.exports = router;
