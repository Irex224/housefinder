const express = require("express");
const { upload } = require("../cloudinary");
const {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
} = require("../controllers/houseController");
const {
  protect,
  optionalProtect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", optionalProtect, getHouses);
router.get("/:id", getHouseById);

router.post(
  "/",
  protect,
  authorize("agent", "moderator", "superadmin"),
  upload.array("images", 10),
  createHouse
);

router.put(
  "/:id",
  protect,
  authorize("agent", "moderator", "superadmin"),
  upload.array("images", 10),
  updateHouse
);

router.delete(
  "/:id",
  protect,
  authorize("agent", "moderator", "superadmin"),
  deleteHouse
);

module.exports = router;
