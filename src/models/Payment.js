const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customerName: String,
    customerEmail: String,
    customerPhone: String,

    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdPackage",
    },

    amount: Number,

    paystackReference: String,

    status: {
      type: String,
      default: "pending",
    },

    paidAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);