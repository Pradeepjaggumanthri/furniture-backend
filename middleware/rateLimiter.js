const rateLimit = require("express-rate-limit");

// Limit OTP sending (max 5 requests per 10 minutes)
exports.otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many OTP requests. Please try again later."
});

// Limit OTP verification (max 10 attempts per 10 minutes)
exports.otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many verification attempts. Try again later."
});
