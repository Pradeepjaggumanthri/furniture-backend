const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendSMS = require("../utils/sendSMS");
const { otpSendLimiter, otpVerifyLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

/* ===============================
   Helper: Generate OTP
================================ */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ===============================
   Register (Email + Password)
================================ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      isVerified: true
    });

    res.json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   Login (Email + Password)
================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & Password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   Send OTP (Mobile Login)
================================ */
router.post("/send-otp", otpSendLimiter, async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile number required" });
    }

    let user = await User.findOne({ mobile });

    if (!user) {
      user = await User.create({
        name: "New User",
        mobile
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // ✅ Send OTP via SMS (Real SMS)
    await sendSMS(mobile, otp);

    res.json({
      message: "OTP sent successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   Verify OTP
================================ */
router.post("/verify-otp", otpVerifyLimiter, async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: "Mobile & OTP required" });
    }

    const user = await User.findOne({ mobile });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpire || user.otpExpire < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
