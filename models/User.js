const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true   // allows null emails
  },

  mobile: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String
  },

  role: {
    type: String,
    default: "user"
  },

  otp: {
    type: String
  },

  otpExpire: {
    type: Date
  },

  isVerified: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
