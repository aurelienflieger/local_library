const BookInstance = require("../models/bookInstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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
  const allBooks = await Book.find({}, "title").exec();
  res.render("bookInstanceForm", {
    bookList: allBooks,
    title: "Create Book Instance",
  });
});

exports.bookInstanceCreatePost = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("dueBack", "Invalid due back date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const bookInstance = new BookInstance({
      book: req.body.book,
      dueBack: req.body.dueBack,
      imprint: req.body.imprint,
      status: req.body.status,
    });

    if (errors.isEmpty()) {
      await bookInstance.save();
      res.redirect(bookInstance.url);
    } else {
      const allBooks = await Book.find({}, "title").exec();
      res.render("bookinstance_form", {
        bookInstance,
        bookList: allBooks,
        errors: errors.array(),
        selectedBook: bookInstance.book._id,
        title: "Create BookInstance",
      });
      return true;
    }
  }),
];

exports.bookInstanceDeleteGet = asyncHandler(async (req, res) => {
  const [bookInstance] = await Promise.all([
    BookInstance.findById(req.params.id).exec(),
  ]);
  res.render("bookInstanceDelete", {
    bookInstance,
    title: "Delete Book Instance",
  });
});

exports.bookInstanceDeletePost = asyncHandler(async (req, res) => {
  await BookInstance.findByIdAndRemove(req.body.bookInstanceID);
  res.redirect("/catalog/bookinstances");
});

exports.bookInstanceUpdateGet = asyncHandler(async (req, res, next) => {
  // Fetch the book instance & books matching the id param, then populate the book field of that book instance.
  const [bookInstance, bookList] = await Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find().exec(),
  ]);

  // Create an error & run it in the next() error middleware if no book instance can be found as the book instance MUST exist in order to update it.
  if (!bookInstance) {
    const error = new Error("Book Instance not found");
    error.status = 404;
    return next(error);
  }

  // Render the bookInstanceForm view
  res.render("bookInstanceForm", {
    bookInstance,
    bookList,
    selectedBook: bookInstance.book._id,
    title: "Update Book Instance",
  });
  return true;
});

exports.bookInstanceUpdatePost = [
  // Validate & sanitize fields
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("dueBack", "Invalid date").optional().isISO8601().toDate(),

  // After validation & sanitization, process request
  asyncHandler(async (req, res) => {
    // Check if the validation check contains errors
    const errors = validationResult(req);
    // Create a Book object with the sanitized data and the original ID.
    const bookInstance = new BookInstance({
      _id: req.params.id,
      book: req.body.book,
      dueBack: req.body.dueBack,
      imprint: req.body.imprint,
      status: req.body.status,
    });

    if (errors.isEmpty()) {
      // If there were no errors, update the book as requested & redirect to the book's details page
      const currentBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {}
      );
      res.redirect(currentBookInstance.url);
    } else {
      // Render the form again with the sanitized values & error messages

      // Get all books for the form's select fields
      const [bookList] = await Book.find({}, "title").exec();

      // Render the same view as for the GET method, but with errors this time
      res.render("bookInstanceForm", {
        bookInstance,
        bookList,
        errors: errors.array(),
        selectedBook: bookInstance.book._id,
        title: "Update Book Instance",
      });
    }
  }),
];
