const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing");
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
      [email, hashedPassword, "user"]
    );

    res.status(201).json({ message: "User created successfully" });

  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }

    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};