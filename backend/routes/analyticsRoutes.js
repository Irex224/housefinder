const express = require("express");
const { getAnalytics } = require("../controllers/analyticsController");
const { protect, requireSuperAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, requireSuperAdmin, getAnalytics);

module.exports = router;
