const express = require("express");
const {
  createInquiry,
  getInquiries,
} = require("../controllers/inquiryController");

const router = express.Router();

// POST /api/inquiries
router.post("/", createInquiry);

// GET /api/inquiries
router.get("/", getInquiries);

module.exports = router;

