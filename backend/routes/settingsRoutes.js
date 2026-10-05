const express = require("express");
const LibrarySettings = require("../models/LibrarySettings");

const router = express.Router();

// GET library settings
router.get("/", async (req, res) => {
  try {
    let settings = await LibrarySettings.findOne();

    // Create default settings only if none exist
    if (!settings) {
      settings = await LibrarySettings.create({
        libraryName: "Roshni Library",
        email: "",
        phone: "",
        address: "",
        openingHours: "Monday - Saturday, 9:00 AM - 8:00 PM",
        borrowingPeriod: 14,
        maxBooksPerMember: 3,
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch library settings",
      error: error.message,
    });
  }
});

// UPDATE library settings
router.put("/", async (req, res) => {
  try {
    const {
      libraryName,
      email,
      phone,
      address,
      openingHours,
      borrowingPeriod,
      maxBooksPerMember,
    } = req.body;

    if (!libraryName || !libraryName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Library name is required",
      });
    }

    if (borrowingPeriod < 1) {
      return res.status(400).json({
        success: false,
        message: "Borrowing period must be at least 1 day",
      });
    }

    if (maxBooksPerMember < 1) {
      return res.status(400).json({
        success: false,
        message: "Maximum books per member must be at least 1",
      });
    }

    const settings = await LibrarySettings.findOneAndUpdate(
      {},
      {
        libraryName: libraryName.trim(),
        email: email?.trim() || "",
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        openingHours: openingHours?.trim() || "",
        borrowingPeriod: Number(borrowingPeriod),
        maxBooksPerMember: Number(maxBooksPerMember),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      success: true,
      message: "Library settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update library settings",
      error: error.message,
    });
  }
});

module.exports = router;