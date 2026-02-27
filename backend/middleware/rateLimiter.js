const rateLimit = require("express-rate-limit");

// 🔐 Strict limiter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per 15 min per IP
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🌐 General API limiter
const apiLimiter = rateLimit({
  windowMs: 15* 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: "Too many requests. Slow down."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
