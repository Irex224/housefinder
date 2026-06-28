const House = require("../models/House");
const {
  canManageListing,
  canUploadListing,
  isAdmin,
  isAgent,
} = require("../utils/roles");

const buildHouseFilter = (query) => {
  const filter = {};

  if (query.location) {
    filter.location = { $regex: query.location, $options: "i" };
  }
  if (query.maxPrice) {
    filter.price = { $lte: Number(query.maxPrice) };
  }
  if (query.bedrooms) {
    filter.bedrooms = { $gte: Number(query.bedrooms) };
  }

  return filter;
};

const getHouses = async (req, res) => {
  try {
    const filter = buildHouseFilter(req.query);

    if (req.query.mine === "true" && req.user) {
      filter.agentId = req.user._id;
    }

    const houses = await House.find(filter)
      .populate("agentId", "name isVerifiedAgent area isSuspended")
      .sort({ createdAt: -1 });
    res.json(houses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch houses" });
  }
};

const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate(
      "agentId",
      "name isVerifiedAgent area phone isSuspended"
    );
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.json(house);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createHouse = async (req, res) => {
  try {
    if (!canUploadListing(req.user)) {
      return res.status(403).json({
        message: isAgent(req.user)
          ? "Verified agents only can upload listings"
          : "You do not have permission to upload listings",
      });
    }

    const { location, price, bedrooms, description } = req.body;
    const files = req.files || [];
    const imageUrls = files.map((file) => file.path);

    if (!imageUrls.length) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const houseData = {
      location,
      price,
      bedrooms,
      description,
      images: imageUrls,
      agentId: req.user._id,
      isVerified: isAdmin(req.user) || req.user.isVerifiedAgent,
    };

    const house = new House(houseData);
    await house.save();

    const populated = await House.findById(house._id).populate(
      "agentId",
      "name isVerifiedAgent area"
    );
    res.status(201).json(populated);
  } catch (err) {
    console.error("Error creating house:", err);
    res.status(400).json({ error: "Failed to add house" });
  }
};

const updateHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (!canManageListing(req.user, house)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { location, price, bedrooms, description } = req.body;
    const files = req.files || [];

    const updateData = {};
    if (location !== undefined) updateData.location = location;
    if (price !== undefined) updateData.price = price;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
    if (description !== undefined) updateData.description = description;

    if (files.length) {
      updateData.images = files.map((file) => file.path);
    }

    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("agentId", "name isVerifiedAgent area");

    res.json(updatedHouse);
  } catch (err) {
    console.error("Error updating house:", err);
    res.status(400).json({ error: "Failed to update house" });
  }
};

const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (!canManageListing(req.user, house)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await House.findByIdAndDelete(req.params.id);
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
