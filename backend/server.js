require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const { connectDatabase, isDatabaseConnected } = require("./config/database");
const bootstrapSuperAdmin = require("./config/bootstrapSuperAdmin");

const authRoutes = require("./routes/authRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const agentRoutes = require("./routes/agentRoutes");
const houseRoutes = require("./routes/houses");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "https://housefinder-frontend.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  if (!isDatabaseConnected() && req.path.startsWith("/api") && req.path !== "/api/health") {
    return res.status(503).json({
      error: "Database unavailable",
      message: "MongoDB is not connected. Check server logs.",
    });
  }
  next();
});

app.get("/", (req, res) => {
  res.json({
    status: isDatabaseConnected() ? "ok" : "degraded",
    message: "HouseFinder backend is running",
    db: isDatabaseConnected() ? "connected" : "disconnected",
  });
});

app.get("/api/health", (req, res) => {
  const connected = isDatabaseConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "degraded",
    uptime: process.uptime(),
    db: connected ? "connected" : "disconnected",
    readyState: mongoose.connection.readyState,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/favourites", favouriteRoutes);

async function startServer() {
  try {
    await connectDatabase();
    await bootstrapSuperAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed — MongoDB must be connected.");
    process.exit(1);
  }
}

startServer();
