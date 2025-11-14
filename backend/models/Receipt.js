const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    items: [
      {
        name: String,
        quantity: Number,
        price: String,
        total: Number,
      },
    ],
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", ReceiptSchema);
