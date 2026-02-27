const mqtt = require("mqtt");
const pool = require("../config/db");
require("dotenv").config();

const client = mqtt.connect(process.env.MQTT_URL);

client.on("connect", () => {
  console.log("✅ MQTT Connected");
  
  client.subscribe("aqi/device/+/data");
});
client.on("message", async (topic, message) => {
  const connection = await pool.getConnection();

  try {
    const data = JSON.parse(message.toString());

    const { device_id, device_token, pm25, aqi } = data;

    // 🔎 1️⃣ Basic structure validation
    if (!device_id || !device_token) {
      console.log("❌ Missing device credentials");
      
      return;
    }

    if (
      typeof pm25 !== "number" ||
      typeof aqi !== "number" ||
      pm25 < 0 ||
      aqi < 0 ||
      aqi > 1000
    ) {
      console.log("❌ Invalid sensor values");
      return;
    }

    // 🔐 2️⃣ Verify device authentication
    const [devices] = await connection.execute(
      "SELECT * FROM devices WHERE device_id=? AND device_token=?",
      [device_id, device_token]
    );

    if (devices.length === 0) {
      console.log("❌ Invalid device authentication attempt");
      return;
    }

    // 🔁 3️⃣ Prevent duplicate flood (within 5 seconds)
    const [last] = await connection.execute(
      "SELECT timestamp FROM readings WHERE device_id=? ORDER BY timestamp DESC LIMIT 1",
      [device_id]
    );

    if (last.length > 0) {
      const lastTime = new Date(last[0].timestamp).getTime();
      const now = Date.now();
      const diff = now - lastTime;

      if (diff < 5000) {
        console.log("⚠ Duplicate reading skipped");
        return;
      }
    }

    // 🔄 4️⃣ Transaction start
    await connection.beginTransaction();

    // 📥 Insert reading
    await connection.execute(
      "INSERT INTO readings (device_id, pm25, aqi) VALUES (?, ?, ?)",
      [device_id, pm25, aqi]
    );

    // 🟢 Update last_seen
    await connection.execute(
      "UPDATE devices SET last_seen = NOW() WHERE device_id=?",
      [device_id]
    );

    // ✅ Commit transaction
    await connection.commit();

    console.log("✅ Secure data saved for:", device_id);

  } catch (err) {
    await connection.rollback();
    console.error("MQTT Error:", err.message);
  } finally {
    connection.release();
  }
});

module.exports = client;