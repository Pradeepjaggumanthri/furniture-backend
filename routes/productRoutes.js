const express = require("express");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Add product (Admin)
router.post("/", protect, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  const product = await Product.create(req.body);
  res.json(product);
});

module.exports = router;
