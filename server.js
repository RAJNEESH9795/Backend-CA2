const express = require("express");
const mongoose = require("mongoose");
const Book = require("./book");

const app = express();
app.use(express.json());

app.post("/api/books", async (req, res) => {
  try {
    const { title, author, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const book = await Book.create({ title, author, category });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const page = Math.max( parseInt(req.query.page,1) || 1);
    const limit = Math.max( parseInt(req.query.limit,1) || 5);

    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Book.countDocuments();

    res.json({ page, limit, total, books });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/books/:id", async (req, res) => {
  try {
    const { available } = req.body;

    if (typeof available !== "boolean") {
      return res.status(400).json({
        message: "available must be true or false"
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (err) {
    res.status(400).json({ message: "Invalid book ID or request" });
  }
});

mongoose.connect("mongodb://127.0.0.1:27017/libraryDB")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch(err => console.log(err.message));
