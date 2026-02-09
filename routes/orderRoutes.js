const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create Order
router.post("/", protect, async (req, res) => {
  const order = await Order.create({
    user: req.user.id,
    items: req.body.items,
    totalAmount: req.body.totalAmount,
    address: req.body.address
  });

  res.json(order);
});

// Get My Orders
router.get("/myorders", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.product");
  res.json(orders);
});

module.exports = router;
