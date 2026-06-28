require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  try {
    console.log("Node:", process.version);
    console.log("URI exists:", !!process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed");
    console.error(err);
    process.exit(1);
  }
})();