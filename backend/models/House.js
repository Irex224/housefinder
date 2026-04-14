const mongoose = require("mongoose");

const HouseSchema = new mongoose.Schema(
  {
    location: { type: String, required: true },
    price: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    description: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    // Multiple images support; empty array is allowed and safe
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("House", HouseSchema);
