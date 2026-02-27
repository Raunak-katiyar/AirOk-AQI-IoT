const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize(["admin", "super_admin"]), async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, email, role FROM users"
  );
  res.json(rows);
});

router.put(
  "/change-role/:id",
  protect,
  authorize(["admin", "super_admin"]),
  async (req, res) => {
    const { role } = req.body;

    await pool.execute(
      "UPDATE users SET role=? WHERE id=?",
      [role, req.params.id]
    );

    res.json({ message: "Role updated successfully" });
  }
);

const bcrypt = require("bcryptjs");

router.put(
  "/change-password/:id",
  protect,
  authorize(["admin", "super_admin"]),
  async (req, res) => {
    const { password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await pool.execute(
      "UPDATE users SET password_hash=? WHERE id=?",
      [hashed, req.params.id]
    );

    res.json({ message: "Password updated successfully" });
  }
);

router.delete(
  "/:id",
  protect,
  authorize(["admin", "super_admin"]),
  async (req, res) => {
    await pool.execute("DELETE FROM users WHERE id=?", [
      req.params.id,
    ]);

    res.json({ message: "User deleted successfully" });
  }
);

module.exports = router;