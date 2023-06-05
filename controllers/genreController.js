const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");

exports.genreList = asyncHandler(async (req, res) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genreList", { genreList: allGenres, title: "Genres" });
});

exports.genreDetail = asyncHandler(async function fetchInfo(req, res, next) {
  const genreID = req.params.id;
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(genreID).exec(),
    Book.find({ genre: genreID }, "title summary").exec(),
  ]);

  if (!genre) {
    const error = new Error("Genre not found");
    error.status = 404;
    return next(error);
  }

  res.render("genreDetail", {
    booksInGenre,
    genre,
    title: "Genre Detail",
  });

  return true;
});

exports.genreCreateGet = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create GET");
});

exports.genreCreatePost = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create POST");
});

exports.genreDeleteGet = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
});

exports.genreDeletePost = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
});

exports.genreUpdateGet = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

exports.genreUpdatePost = asyncHandler(async (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});
