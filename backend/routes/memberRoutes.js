const express = require("express");
const Member = require("../models/Member");

const router = express.Router();

// GET all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
      error: error.message,
    });
  }
});

// GET one member
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.json({
      success: true,
      member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch member",
      error: error.message,
    });
  }
});

// ADD member
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      memberId,
      membershipType,
    } = req.body;

    if (!name || !email || !phone || !memberId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and member ID are required",
      });
    }

    const existingMember = await Member.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { memberId: memberId.trim() },
      ],
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "Email or member ID already exists",
      });
    }

    const member = await Member.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      memberId: memberId.trim(),
      membershipType: membershipType || "Student",
    });

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
});

// UPDATE member
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      memberId,
      membershipType,
      status,
    } = req.body;

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const duplicate = await Member.findOne({
      _id: { $ne: member._id },
      $or: [
        { email: email.trim().toLowerCase() },
        { memberId: memberId.trim() },
      ],
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email or member ID already belongs to another member",
      });
    }

    member.name = name.trim();
    member.email = email.trim().toLowerCase();
    member.phone = phone.trim();
    member.memberId = memberId.trim();
    member.membershipType = membershipType;
    member.status = status;

    await member.save();

    res.json({
      success: true,
      message: "Member updated successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update member",
      error: error.message,
    });
  }
});

// DELETE member
router.delete("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await Member.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete member",
      error: error.message,
    });
  }
});

module.exports = router;