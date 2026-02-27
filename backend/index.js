require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const { apiLimiter } = require("./middleware/rateLimiter");
const { protect } = require("./middleware/authMiddleware");

require("./services/mqttService");

const deviceRoutes = require("./routes/deviceRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");   // ✅ NEW LINE

// ==========================
// 🔹 CORS Configuration
// ==========================
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ==========================
// 🔹 Middleware
// ==========================
app.use(express.json());

// ==========================
// 🔹 Root Route
// ==========================
app.get("/", (req, res) => {
  res.send("AQI Backend Running 🚀");
});

// ==========================
// 🔐 Auth Routes (Rate Limited)
// ==========================
app.use("/api/auth", apiLimiter, authRoutes);

// ==========================
// 📡 Device Routes
// ==========================
app.use("/api/device", deviceRoutes);

// ==========================
// 👤 User Routes (Super Admin Only)  ✅ NEW
// ==========================
app.use("/api/users", userRoutes);

// ==========================
// 🔐 Protected Test Route
// ==========================
app.get("/api/test", protect, (req, res) => {
  res.json({ message: "Protected route working ✅" });
});

// ==========================
// ❗ Global Error Handler
// ==========================
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ==========================
// 🚀 Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});