const Author = require("../models/author");
const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res) => {
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render("index", {
    authorsCount: numAuthors,
    bookCount: numBooks,
    bookInstanceAvailableCount: numAvailableBookInstances,
    bookInstanceCount: numBookInstances,
    genreCount: numGenres,
    title: "Local Library Home",
  });
});

exports.bookList = asyncHandler(async (req, res) => {
  const allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec();
  res.render("bookList", { bookList: allBooks, title: "Book List" });
});

exports.bookDetail = asyncHandler(async function fetchInfo(req, res, next) {
  const bookID = req.params.id;
  const [book, bookInstances] = await Promise.all([
    Book.findById(bookID).populate("author").populate("genre").exec(),
    BookInstance.find({ book: bookID }).exec(),
  ]);

  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    return next(error);
  }

  res.render("bookDetail", {
    book,
    bookInstances,
    title: book.title,
  });

  return true;
});

exports.bookCreateGet = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Book create GET");
});

exports.bookCreatePost = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Book create POST");
});

exports.bookDeleteGet = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
});

exports.bookDeletePost = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
});

exports.bookUpdateGet = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

exports.bookUpdatePost = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});
