const express = require("express");
const AgentApplication = require("../models/AgentApplication");

const router = express.Router();

// Submit a new agent application
router.post("/apply", async (req, res) => {
  try {
    const { name, email, phone, experience, area } = req.body;

    if (!name || !email || !phone || !experience || !area) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const application = new AgentApplication({
      name,
      email,
      phone,
      experience,
      area,
      status: "pending",
    });

    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (err) {
    console.error("Error creating agent application:", err);
    res.status(500).json({ message: "Failed to submit application." });
  }
});

// Get all agent applications
router.get("/applications", async (req, res) => {
  try {
    const applications = await AgentApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Failed to fetch applications." });
  }
});

// Update application status (e.g., approve)
router.patch("/applications/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const updated = await AgentApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ message: "Failed to update application." });
  }
});

module.exports = router;

