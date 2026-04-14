const express = require("express");
const { upload } = require("../cloudinary");
const {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
} = require("../controllers/houseController");

const router = express.Router();

// GET all houses
router.get("/", getHouses);

// GET a single house by ID
router.get("/:id", getHouseById);

// CREATE a house with multiple images
router.post("/", upload.array("images", 10), createHouse);

// UPDATE a house (optionally with new images)
router.put("/:id", upload.array("images", 10), updateHouse);

// DELETE a house
router.delete("/:id", deleteHouse);

module.exports = router;

