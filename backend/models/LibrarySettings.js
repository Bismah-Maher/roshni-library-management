const mongoose = require("mongoose");

const librarySettingsSchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      required: true,
      trim: true,
      default: "Roshni Library",
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    openingHours: {
      type: String,
      trim: true,
      default: "Monday - Saturday, 9:00 AM - 8:00 PM",
    },

    borrowingPeriod: {
      type: Number,
      min: 1,
      default: 14,
    },

    maxBooksPerMember: {
      type: Number,
      min: 1,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LibrarySettings",
  librarySettingsSchema
);