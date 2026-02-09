const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number
    }
  ],
  totalAmount: Number,
  address: String,
  status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
