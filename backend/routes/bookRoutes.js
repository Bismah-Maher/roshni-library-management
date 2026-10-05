const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

/*
  GET /api/books
  Get all books
*/
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error: error.message,
    });
  }
});

/*
  GET /api/books/:id
  Get one book
*/
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch book",
      error: error.message,
    });
  }
});

/*
  POST /api/books
  Add a new book
*/
router.post("/", async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      language,
      totalCopies,
    } = req.body;

    if (
      !title ||
      !author ||
      !category ||
      !language ||
      totalCopies === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All book fields are required",
      });
    }

    if (Number(totalCopies) < 1) {
      return res.status(400).json({
        success: false,
        message: "Total copies must be at least 1",
      });
    }

    const existingBook = await Book.findOne({
      title: title.trim(),
      author: author.trim(),
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "This book already exists",
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      language,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add book",
      error: error.message,
    });
  }
});

/*
  PUT /api/books/:id
  Update a book
*/
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      language,
      totalCopies,
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const borrowedCopies =
      book.totalCopies - book.availableCopies;

    if (Number(totalCopies) < borrowedCopies) {
      return res.status(400).json({
        success: false,
        message: `Total copies cannot be less than ${borrowedCopies} because those copies are currently borrowed.`,
      });
    }

    const duplicate = await Book.findOne({
      _id: { $ne: book._id },
      title: title.trim(),
      author: author.trim(),
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another book with this title and author already exists",
      });
    }

    book.title = title.trim();
    book.author = author.trim();
    book.category = category.trim();
    book.language = language;
    book.totalCopies = Number(totalCopies);
    book.availableCopies =
      Number(totalCopies) - borrowedCopies;

    await book.save();

    res.json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
});

/*
  DELETE /api/books/:id
  Delete a book
*/
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const borrowedCopies =
      book.totalCopies - book.availableCopies;

    if (borrowedCopies > 0) {
      return res.status(400).json({
        success: false,
        message: `This book cannot be deleted because ${borrowedCopies} copy/copies are currently borrowed.`,
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
});

module.exports = router;