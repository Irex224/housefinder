const express = require("express");
const {
  applyAgent,
  getApplications,
  approveAgent,
} = require("../controllers/agentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/apply", applyAgent);

router.get(
  "/applications",
  protect,
  authorize("moderator", "superadmin"),
  getApplications
);

router.put(
  "/:id/approve",
  protect,
  authorize("moderator", "superadmin"),
  approveAgent
);

router.patch(
  "/applications/:id",
  protect,
  authorize("moderator", "superadmin"),
  approveAgent
);

module.exports = router;
