const mongoose = require("mongoose");

const SavedHouseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
  },
  { timestamps: true }
);

SavedHouseSchema.index({ userId: 1, houseId: 1 }, { unique: true });

module.exports = mongoose.model("SavedHouse", SavedHouseSchema);
