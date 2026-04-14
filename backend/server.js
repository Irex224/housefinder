require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

// --- Import Cloudinary & Upload ---
const { upload } = require("./cloudinary"); // kept for backwards compatibility if needed elsewhere

// --- Import Routes ---
const authRoutes = require("./routes/authRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const agentRoutes = require("./routes/agentRoutes");
const houseRoutes = require("./routes/houses");
const reportRoutes = require("./routes/reportRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // ✅ allows frontend to connect
app.use(express.json());
app.use(morgan("dev"));
// Static serving for uploaded files (if any local uploads are used)
app.use("/uploads", express.static("uploads"));

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Routes ---
app.get("/", (req, res) => {
  res.send("HouseFinder backend is running 🚀");
});
// --- Auth Routes ---
app.use("/api/auth", authRoutes);
// --- Inquiry Routes ---
app.use("/api/inquiries", inquiryRoutes);
// --- Agent Routes ---
app.use("/api/agents", agentRoutes);
// --- House Routes ---
app.use("/api/houses", houseRoutes);

// --- Report Routes ---
app.use("/api/reports", reportRoutes);

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
