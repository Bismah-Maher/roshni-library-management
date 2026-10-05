
const express = require("express");
const mongoose = require("mongoose");

const Book = require("../models/Book");
const Member = require("../models/Member");
const Borrowing = require("../models/Borrowing");

const router = express.Router();

// GET ALL BORROWING RECORDS
router.get("/", async (req, res) => {
  try {
    const records = await Borrowing.find()
      .populate("book", "title author category")
      .populate("member", "name email memberId")
      .sort({ createdAt: -1 });

    const recordsWithOverdueStatus = records.map((record) => {
      const isOverdue =
        record.status === "Issued" &&
        new Date(record.dueDate) < new Date();

      return {
        ...record.toObject(),
        isOverdue,
        displayStatus: isOverdue ? "Overdue" : record.status,
      };
    });

    res.json({
      success: true,
      records: recordsWithOverdueStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch borrowing records",
      error: error.message,
    });
  }
});

// ISSUE A BOOK
router.post("/issue", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookId, memberId, dueDate } = req.body;

    if (!bookId || !memberId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Book, member and due date are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(bookId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid book or member ID",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (
      Number.isNaN(parsedDueDate.getTime()) ||
      parsedDueDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Due date must be a valid future date",
      });
    }

    let borrowing;

    await session.withTransaction(async () => {
      const member = await Member.findById(memberId).session(session);

      if (!member) {
        throw new Error("MEMBER_NOT_FOUND");
      }

      if (member.status !== "Active") {
        throw new Error("MEMBER_INACTIVE");
      }

      const book = await Book.findById(bookId).session(session);

      if (!book) {
        throw new Error("BOOK_NOT_FOUND");
      }

      const existingBorrowing = await Borrowing.findOne({
        book: bookId,
        member: memberId,
        status: "Issued",
      }).session(session);

      if (existingBorrowing) {
        throw new Error("BOOK_ALREADY_ISSUED_TO_MEMBER");
      }

      const updatedBook = await Book.findOneAndUpdate(
        {
          _id: bookId,
          availableCopies: { $gt: 0 },
        },
        {
          $inc: { availableCopies: -1 },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedBook) {
        throw new Error("BOOK_NOT_AVAILABLE");
      }

      const createdRecords = await Borrowing.create(
        [
          {
            book: bookId,
            member: memberId,
            dueDate: parsedDueDate,
            status: "Issued",
          },
        ],
        { session }
      );

      borrowing = createdRecords[0];
    });

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      borrowing,
    });
  } catch (error) {
    const messages = {
      MEMBER_NOT_FOUND: [404, "Member not found"],
      MEMBER_INACTIVE: [400, "This member is inactive"],
      BOOK_NOT_FOUND: [404, "Book not found"],
      BOOK_NOT_AVAILABLE: [400, "No copies of this book are available"],
      BOOK_ALREADY_ISSUED_TO_MEMBER: [
        400,
        "This member already has an active issue of this book",
      ],
    };

    const knownError = messages[error.message];

    res.status(knownError ? knownError[0] : 500).json({
      success: false,
      message: knownError
        ? knownError[1]
        : "Failed to issue book",
      ...(knownError ? {} : { error: error.message }),
    });
  } finally {
    await session.endSession();
  }
});

// RETURN A BOOK
router.post("/:id/return", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid borrowing record ID",
      });
    }

    let returnedRecord;

    await session.withTransaction(async () => {
      const borrowing = await Borrowing.findOne({
        _id: req.params.id,
        status: "Issued",
      }).session(session);

      if (!borrowing) {
        throw new Error("ACTIVE_BORROWING_NOT_FOUND");
      }

      const updatedBook = await Book.findByIdAndUpdate(
        borrowing.book,
        {
          $inc: { availableCopies: 1 },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedBook) {
        throw new Error("BOOK_NOT_FOUND");
      }

      borrowing.status = "Returned";
      borrowing.returnedAt = new Date();

      await borrowing.save({ session });

      returnedRecord = borrowing;
    });

    res.json({
      success: true,
      message: "Book returned successfully",
      borrowing: returnedRecord,
    });
  } catch (error) {
    const knownErrors = {
      ACTIVE_BORROWING_NOT_FOUND: [404, "Active borrowing record not found"],
      BOOK_NOT_FOUND: [404, "Associated book not found"],
    };

    const knownError = knownErrors[error.message];

    res.status(knownError ? knownError[0] : 500).json({
      success: false,
      message: knownError
        ? knownError[1]
        : "Failed to return book",
      ...(knownError ? {} : { error: error.message }),
    });
  } finally {
    await session.endSession();
  }
});

module.exports = router;