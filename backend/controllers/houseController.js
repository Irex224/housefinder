const House = require("../models/House");

// GET /api/houses
const getHouses = async (req, res) => {
  try {
    const houses = await House.find();
    res.json(houses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch houses" });
  }
};

// GET /api/houses/:id
const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.json(house);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/houses
const createHouse = async (req, res) => {
  try {
    const { location, price, bedrooms, description } = req.body;

    const files = req.files || [];
    const imageUrls = files.map((file) => file.path);

    if (!imageUrls.length) {
      return res.status(400).json({ error: "Image upload failed" });
    }

    const house = new House({
      location,
      price,
      bedrooms,
      description,
      images: imageUrls,
    });

    await house.save();
    res.status(201).json(house);
  } catch (err) {
    console.error("Error creating house:", err);
    res.status(400).json({ error: "Failed to add house" });
  }
};

// PUT /api/houses/:id
const updateHouse = async (req, res) => {
  try {
    const { location, price, bedrooms, description } = req.body;
    const files = req.files || [];

    const updateData = {};
    if (location !== undefined) updateData.location = location;
    if (price !== undefined) updateData.price = price;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
    if (description !== undefined) updateData.description = description;

    if (files.length) {
      const imageUrls = files.map((file) => file.path);
      updateData.images = imageUrls;
    }

    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedHouse) {
      return res.status(404).json({ message: "House not found" });
    }

    res.json(updatedHouse);
  } catch (err) {
    console.error("Error updating house:", err);
    res.status(400).json({ error: "Failed to update house" });
  }
};

// DELETE /api/houses/:id
const deleteHouse = async (req, res) => {
  try {
    const deletedHouse = await House.findByIdAndDelete(req.params.id);
    if (!deletedHouse) {
      return res.status(404).json({ message: "House not found" });
    }
    res.json({ message: "House deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete house" });
  }
};

module.exports = {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
};

