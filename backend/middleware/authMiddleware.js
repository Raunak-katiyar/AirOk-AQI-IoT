const jwt = require("jsonwebtoken");
require("dotenv").config();

// 🔐 Verify JWT Token
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token payload should contain: { id, role }
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// 🔐 Role-based Authorization
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = { protect, authorize };