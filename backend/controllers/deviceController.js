const pool = require("../config/db");
const crypto = require("crypto");

// ==========================
// 🔹 Helper Function
// ==========================
function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

// ==========================
// 🔹 Create Device
// ==========================
exports.createDevice = async (req, res) => {
  const { device_id, location } = req.body;
  const device_token = crypto.randomBytes(16).toString("hex");

  try {
    await pool.execute(
      "INSERT INTO devices (device_id, device_token, location) VALUES (?, ?, ?)",
      [device_id, device_token, location]
    );

    res.status(201).json({
      message: "Device created successfully",
      device_id,
      device_token
    });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Device ID already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================
// 🔹 Assign Device
// ==========================
exports.assignDevice = async (req, res) => {
  const { device_id, user_id } = req.body;

  try {
    await pool.execute(
      "INSERT INTO device_users (device_id, user_id) VALUES (?, ?)",
      [device_id, user_id]
    );

    res.json({ message: "Device assigned successfully" });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Already assigned" });
    }
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================
// 🔹 Get My Devices
// ==========================
exports.getMyDevices = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        d.device_id,
        d.location,
        d.last_seen,
        TIMESTAMPDIFF(MINUTE, d.last_seen, NOW()) as minutes_ago
      FROM devices d
      JOIN device_users du ON d.device_id = du.device_id
      WHERE du.user_id=?
      `,
      [userId]
    );

    const devicesWithStatus = rows.map((device) => {
      let status = "offline";

      if (device.last_seen && device.minutes_ago <= 15) {
        status = "online";
      }

      return {
        device_id: device.device_id,
        location: device.location,
        status,
      };
    });

    res.json(devicesWithStatus);

  } catch (err) {
    console.error("GetMyDevices Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
// ==========================
// 🔹 Latest By Device
// ==========================
exports.getLatestByDeviceId = async (req, res) => {
  const userId = req.user.id;
  const { deviceId } = req.params;

  try {
    const [rows] = await pool.execute(`
      SELECT 
        d.device_id,
        d.last_seen,
        r.aqi,
        r.pm25,
        r.timestamp,
        TIMESTAMPDIFF(MINUTE, d.last_seen, NOW()) as minutes_ago
      FROM devices d
      JOIN device_users du ON d.device_id = du.device_id
      JOIN readings r ON r.device_id = d.device_id
      WHERE d.device_id=? AND du.user_id=?
      ORDER BY r.timestamp DESC
      LIMIT 1
    `, [deviceId, userId]);

    if (!rows.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const data = rows[0];

    const status =
      !data.last_seen || data.minutes_ago > 15
        ? "offline"
        : "online";

    res.set("Cache-Control", "no-store");

    res.json({
      device_id: data.device_id,
      aqi: data.aqi,
      pm25: data.pm25,
      timestamp: data.timestamp,
      category: getAQICategory(data.aqi),
      status,
      minutes_ago: data.minutes_ago
    });

  } catch (err) {
    console.error("Latest Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================
// 🔹 Dashboard Data
// ==========================
// exports.getDashboardData = async (req, res) => {
//   const userId = req.user.id;
//   const { device_id } = req.params;

//   try {
//     const [access] = await pool.execute(`
//       SELECT d.device_id, d.location, d.last_seen
//       FROM devices d
//       JOIN device_users du ON d.device_id = du.device_id
//       WHERE d.device_id=? AND du.user_id=?
//     `, [device_id, userId]);

//     if (!access.length) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const [rows] = await pool.execute(
//       "SELECT * FROM readings WHERE device_id=? ORDER BY timestamp DESC LIMIT 1",
//       [device_id]
//     );

//     if (!rows.length) {
//       return res.status(404).json({ message: "No data found" });
//     }

//     const data = rows[0];

//     res.json({
//       device_id,
//       location: access[0].location,
//       last_seen: access[0].last_seen,
//       aqi: data.aqi,
//       pm25: data.pm25,
//       timestamp: data.timestamp,
//       category: getAQICategory(data.aqi)
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


exports.getDashboardData = async (req, res) => {
  const userId = req.user.id;
  const { device_id } = req.params;

  try {
    const [access] = await pool.execute(`
      SELECT d.device_id, d.location, d.last_seen
      FROM devices d
      JOIN device_users du ON d.device_id = du.device_id
      WHERE d.device_id=? AND du.user_id=?
    `, [device_id, userId]);

    if (!access.length) {
      return res.status(403).json({ message: "Access denied" });
    }

    const device = access[0];

    const [rows] = await pool.execute(
      "SELECT * FROM readings WHERE device_id=? ORDER BY timestamp DESC LIMIT 1",
      [device_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const data = rows[0];

    let minutesAgo = 9999;

    if (device.last_seen) {
      const [diff] = await pool.execute(
        "SELECT TIMESTAMPDIFF(MINUTE, ?, NOW()) as minutes_ago",
        [device.last_seen]
      );
      minutesAgo = diff[0].minutes_ago;
    }

    const status =
      !device.last_seen || minutesAgo > 15
        ? "offline"
        : "online";

    res.json({
      device_id,
      location: device.location,
      last_seen: device.last_seen,
      aqi: data.aqi,
      pm25: data.pm25,
      timestamp: data.timestamp,
      category: getAQICategory(data.aqi),
      status,
      minutes_ago: minutesAgo
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================
// 🔹 Hourly Graph (Secure)
// ==========================
exports.getHourlyGraph = async (req, res) => {
  const userId = req.user.id;
  const { device_id } = req.params;
  const { range } = req.query;

  let intervalQuery = "24 HOUR";
  let groupByQuery = "";

  // 🔹 Decide Range
  if (range === "12h") {
    intervalQuery = "12 HOUR";

    groupByQuery = `
      DATE_FORMAT(
        DATE_SUB(timestamp, INTERVAL MINUTE(timestamp) % 30 MINUTE),
        '%Y-%m-%d %H:%i'
      )
    `;
  }

  else if (range === "24h") {
    intervalQuery = "24 HOUR";

    groupByQuery = `
      DATE_FORMAT(
        DATE_SUB(timestamp, INTERVAL MINUTE(timestamp) % 30 MINUTE),
        '%Y-%m-%d %H:%i'
      )
    `;
  }

  else if (range === "7d") {
  intervalQuery = "7 DAY";

  groupByQuery = `
    DATE_FORMAT(
      DATE_SUB(
        DATE_SUB(timestamp, INTERVAL MINUTE(timestamp) MINUTE),
        INTERVAL (HOUR(timestamp) % 6) HOUR
      ),
      '%Y-%m-%d %H:00'
    )
  `;
}

else if (range === "30d") {
  intervalQuery = "30 DAY";

  groupByQuery = `
    DATE_FORMAT(
      DATE_SUB(timestamp, INTERVAL HOUR(timestamp) HOUR),
      '%Y-%m-%d'
    )
  `;
}

  try {
    // 🔹 Check access
    const [access] = await pool.execute(`
      SELECT d.device_id
      FROM devices d
      JOIN device_users du ON d.device_id = du.device_id
      WHERE d.device_id=? AND du.user_id=?
    `, [device_id, userId]);

    if (!access.length) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔹 Main Query
    const [rows] = await pool.execute(`
      SELECT 
        ${groupByQuery} as time_slot,
        ROUND(AVG(aqi)) as avg_aqi
      FROM readings
      WHERE device_id=?
      AND timestamp > NOW() - INTERVAL ${intervalQuery}
      GROUP BY time_slot
      ORDER BY time_slot ASC
    `, [device_id]);

    res.set("Cache-Control", "no-store");
    res.json(rows);

  } catch (err) {
    console.error("Graph Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
// ==========================
// 🔹 My Latest AQI
// ==========================
exports.getMyLatestAQI = async (req, res) => {
  const userId = req.user.id;

  try {
    const [devices] = await pool.execute(`
      SELECT d.device_id
      FROM devices d
      JOIN device_users du ON d.device_id = du.device_id
      WHERE du.user_id=?
      LIMIT 1
    `, [userId]);

    if (!devices.length) {
      return res.json({ message: "No device assigned" });
    }

    const deviceId = devices[0].device_id;

    const [rows] = await pool.execute(
      "SELECT * FROM readings WHERE device_id=? ORDER BY timestamp DESC LIMIT 1",
      [deviceId]
    );

    if (!rows.length) return res.json({});

    const data = rows[0];

    res.json({
      device_id: deviceId,
      aqi: data.aqi,
      pm25: data.pm25,
      timestamp: data.timestamp,
      category: getAQICategory(data.aqi)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================
// 🔹 Admin Summary
// ==========================
exports.getAdminSummary = async (req, res) => {
  try {
    const [[totalDevices]] = await pool.execute(
      "SELECT COUNT(*) as count FROM devices"
    );

    const [[totalUsers]] = await pool.execute(
      "SELECT COUNT(*) as count FROM users"
    );

    res.json({
      total_devices: totalDevices.count,
      total_users: totalUsers.count
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};