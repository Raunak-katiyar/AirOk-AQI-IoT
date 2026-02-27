const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const pool = require("../config/db");
const deviceController = require("../controllers/deviceController");

const asyncHandler = require("../middleware/asyncHandler");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");


// ==========================
// 🔹 Super Admin - Create Device
// ==========================
router.post(
  "/create",
  protect,
  authorize(["super_admin"]),

  body("device_id").notEmpty().withMessage("Device ID is required"),
  body("location").notEmpty().withMessage("Location is required"),

  validate,
  asyncHandler(deviceController.createDevice)
);


// ==========================
// 🔹 Admin / Super Admin - Assign Device
// ==========================
router.post(
  "/assign",
  protect,
  authorize(["admin", "super_admin"]),

  body("device_id").notEmpty().withMessage("Device ID is required"),
  body("user_id").isInt().withMessage("User ID must be a number"),

  validate,
  asyncHandler(deviceController.assignDevice)
);


// ==========================
// 🔹 Admin / Super Admin - Unassign Device (Specific User)
// ==========================
router.post(
  "/unassign",
  protect,
  authorize(["admin", "super_admin"]),

  body("device_id").notEmpty().withMessage("Device ID required"),
  body("user_id").isInt().withMessage("User ID required"),

  validate,
  asyncHandler(async (req, res) => {
    const { device_id, user_id } = req.body;

    await pool.execute(
      "DELETE FROM device_users WHERE device_id=? AND user_id=?",
      [device_id, user_id]
    );

    res.json({ message: "Device unassigned successfully" });
  })
);


// ==========================
// 🔹 User / Admin - Get Own Devices
// ==========================
router.get(
  "/my-devices",
  protect,
  authorize(["user", "admin", "super_admin"]),
  asyncHandler(deviceController.getMyDevices)
);


// ==========================
// 🔹 Latest AQI by Device ID
// ==========================
router.get(
  "/latest/:deviceId",
  protect,
  authorize(["user", "admin", "super_admin"]),
  asyncHandler(deviceController.getLatestByDeviceId)
);


// ==========================
// 🔹 Hourly Graph
// ==========================
router.get(
  "/graph/:device_id",
  protect,
  authorize(["user", "admin", "super_admin"]),
  asyncHandler(deviceController.getHourlyGraph)
);


// ==========================
// 🔹 Latest AQI for Logged-in User
// ==========================
router.get(
  "/my-latest",
  protect,
  authorize(["user", "admin", "super_admin"]),
  asyncHandler(deviceController.getMyLatestAQI)
);


// ==========================
// 🔹 Admin Summary
// ==========================
router.get(
  "/admin-summary",
  protect,
  authorize(["admin", "super_admin"]),
  asyncHandler(deviceController.getAdminSummary)
);


// ==========================
// 🔹 Admin / Super Admin - Get All Devices (Multi User)
// ==========================
router.get(
  "/all",
  protect,
  authorize(["admin", "super_admin"]),
  asyncHandler(async (req, res) => {

    const [rows] = await pool.execute(`
      SELECT 
        d.device_id,
        d.location,
        GROUP_CONCAT(u.email) AS assigned_to
      FROM devices d
      LEFT JOIN device_users du ON d.device_id = du.device_id
      LEFT JOIN users u ON du.user_id = u.id
      GROUP BY d.device_id, d.location
    `);

    res.json(rows);
  })
);


// ==========================
// 🔹 Super Admin - Delete Device
// ==========================
router.delete(
  "/:device_id",
  protect,
  authorize(["super_admin"]),
  asyncHandler(async (req, res) => {
    const { device_id } = req.params;

    await pool.execute(
      "DELETE FROM devices WHERE device_id=?",
      [device_id]
    );

    res.json({ message: "Device deleted successfully" });
  })
);

module.exports = router;