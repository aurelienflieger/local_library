const BookInstance = require("../models/bookInstance");
const asyncHandler = require("express-async-handler");

exports.bookInstanceList = asyncHandler(async (req, res) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookInstanceList", {
    bookInstanceList: allBookInstances,
    title: "Book Instance List",
  });
});

exports.bookInstanceDetail = asyncHandler(async function fetchInfo(
  req,
  res,
  next
) {
  const bookInstanceID = req.params.id;
  const bookInstance = await BookInstance.findById(bookInstanceID)
    .populate("book")
    .exec();

  if (!bookInstance) {
    const error = new Error("Book copy not found");
    error.status = 404;
    return next(error);
  }

  res.render("bookInstanceDetail", {
    bookInstance,
    title: "Book:",
  });

  return true;
});

exports.bookInstanceCreateGet = asyncHandler(async (req, res) => {
  res.send("Not implemented: BookInstance create GET");
});

exports.bookInstanceCreatePost = asyncHandler(async (req, res) => {
  res.send("Not implemented: BookInstance create POST");
});

exports.bookInstanceDeleteGet = asyncHandler(async (req, res) => {
  res.send("Not implemented: BookInstance delete GET");
});

exports.bookInstanceDeletePost = asyncHandler(async (req, res) => {
  res.send("Not implemented: BookInstance delete POST");
});

exports.bookInstanceUpdateGet = asyncHandler(async (req, res) => {
  res.send("Not implemented: BookInstance update GET");
});

exports.bookInstanceUpdatePost = asyncHandler(async (req, res) => {
  res.send("Not implemented: BookInstance update POST");
});
