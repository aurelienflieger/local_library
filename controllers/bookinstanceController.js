const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");

exports.bookInstanceList = asyncHandler(async (req, res) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    bookInstanceList: allBookInstances,
    title: "Book Instance List",
  });
});

exports.bookInstanceDetail = asyncHandler(async (req, res) => {
  res.send(`Not implemented: BookInstance detail:${req.params.id}`);
});

exports.bookinstanceCreateGet = asyncHandler(async (req, res) => {
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
