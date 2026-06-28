const express = require("express");
const {
  getUsers,
  banUser,
  unbanUser,
  createAdmin,
  removeAdmin,
  suspendAgent,
  unsuspendAgent,
} = require("../controllers/adminController");
const {
  protect,
  requireSuperAdmin,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/users", requireSuperAdmin, getUsers);
router.put("/users/:id/ban", requireSuperAdmin, banUser);
router.put("/users/:id/unban", requireSuperAdmin, unbanUser);

router.post("/admins", requireSuperAdmin, createAdmin);
router.delete("/admins/:id", requireSuperAdmin, removeAdmin);

router.put("/agents/:id/suspend", requireAdmin, suspendAgent);
router.put("/agents/:id/unsuspend", requireAdmin, unsuspendAgent);

module.exports = router;
