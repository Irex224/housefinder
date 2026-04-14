import express from "express";
import House from "../models/houseModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all houses (public)
router.get("/", async (req, res) => {
  try {
    const houses = await House.find();
    res.json(houses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add a new house (PROTECTED)
router.post("/", protect, async (req, res) => {
  try {
    const { location, price, bedrooms, image } = req.body;
    const house = new House({ location, price, bedrooms, image });
    const savedHouse = await house.save();
    res.status(201).json(savedHouse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a house (PROTECTED)
router.put('/:id', protect, async (req, res) => {
  try {
    const { location, price, bedrooms, image } = req.body;

    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    house.location = location || house.location;
    house.price = price || house.price;
    house.bedrooms = bedrooms || house.bedrooms;
    house.image = image || house.image;

    const updatedHouse = await house.save();
    res.json(updatedHouse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// ✅ DELETE house (PROTECTED)
router.delete("/:id", protect, async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    await house.deleteOne();
    res.json({ message: "House deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
