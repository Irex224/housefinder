const express = require("express");
const {
  getFavourites,
  addFavourite,
  removeFavourite,
  getFavouriteIds,
} = require("../controllers/favouriteController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getFavourites);
router.get("/ids", getFavouriteIds);
router.post("/:houseId", addFavourite);
router.delete("/:houseId", removeFavourite);

module.exports = router;
