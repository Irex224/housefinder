const SavedHouse = require("../models/SavedHouse");
const House = require("../models/House");

const getFavourites = async (req, res) => {
  try {
    const saved = await SavedHouse.find({ userId: req.user._id })
      .populate({
        path: "houseId",
        populate: { path: "agentId", select: "name isVerifiedAgent area" },
      })
      .sort({ createdAt: -1 });

    const houses = saved
      .map((entry) => entry.houseId)
      .filter(Boolean);

    res.json(houses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favourites" });
  }
};

const addFavourite = async (req, res) => {
  try {
    const house = await House.findById(req.params.houseId);
    if (!house) return res.status(404).json({ error: "House not found" });

    const existing = await SavedHouse.findOne({
      userId: req.user._id,
      houseId: req.params.houseId,
    });
    if (existing) {
      return res.status(200).json({ message: "Already saved" });
    }

    await SavedHouse.create({
      userId: req.user._id,
      houseId: req.params.houseId,
    });

    res.status(201).json({ message: "Saved to favourites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save favourite" });
  }
};

const removeFavourite = async (req, res) => {
  try {
    await SavedHouse.findOneAndDelete({
      userId: req.user._id,
      houseId: req.params.houseId,
    });
    res.json({ message: "Removed from favourites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove favourite" });
  }
};

const getFavouriteIds = async (req, res) => {
  try {
    const saved = await SavedHouse.find({ userId: req.user._id }).select("houseId");
    res.json(saved.map((s) => s.houseId.toString()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favourite ids" });
  }
};

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
  getFavouriteIds,
};
