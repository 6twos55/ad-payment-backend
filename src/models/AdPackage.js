const mongoose = require("mongoose");

const adPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number,
      required: true, // in days
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdPackage", adPackageSchema);