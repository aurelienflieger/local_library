const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");

exports.authorList = asyncHandler(async (req, res) => {
  const allAuthors = await Author.find().sort({ familyName: 1 }).exec();
  res.render("authorList", {
    authorList: allAuthors,
    title: "Author List",
  });
});

exports.authorDetail = asyncHandler(async function fetchInfo(req, res, next) {
  const authorId = req.params.id;
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(authorId).exec(),
    Book.find({ author: authorId }, "title summary").exec(),
  ]);

  if (!author) {
    const error = new Error("Author not found");
    error.status = 404;
    return next(error);
  }

  res.render("authorDetail", {
    allBooksByAuthor,
    author,
    title: "Author Detail",
  });

  return true;
});

exports.authorCreateGet = asyncHandler(async (req, res) => {
  res.send("Not implemented: Author create GET");
});

exports.authorCreatePost = asyncHandler(async (req, res) => {
  res.send("Not implemented: Author create POST");
});

exports.authorDeleteGet = asyncHandler(async (req, res) => {
  res.send("Not implemented: Author delete GET");
});

exports.authorDeletePost = asyncHandler(async (req, res) => {
  res.send("Not implemented: Author delete POST");
});

exports.authorUpdateGet = asyncHandler(async (req, res) => {
  res.send("Not implemented: Author update GET");
});

exports.authorUpdatePost = asyncHandler(async (req, res) => {
  res.send("Not implemented: Author update POST");
});
