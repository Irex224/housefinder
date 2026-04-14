const express = require("express");
const {
  applyAgent,
  getApplications,
  approveAgent,
} = require("../controllers/agentController");

const router = express.Router();

// POST /api/agents/apply
router.post("/apply", applyAgent);

// GET /api/agents/applications
router.get("/applications", getApplications);

// PUT /api/agents/:id/approve
router.put("/:id/approve", approveAgent);

// Backwards compatibility for existing frontend/dashboard
router.patch("/applications/:id", approveAgent);

module.exports = router;

