const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    format: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    paystackReference: String,

    paymentLink: String,

    status: {
      type: String,
      enum: ["pending", "success", "expired"],
      default: "pending",
    },

    paidAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ status: 1 });
paymentSchema.index({ customerEmail: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
