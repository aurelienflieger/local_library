const Author = require("../models/author");
const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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
  const [allAuthors, allGenres] = await Promise.all([
    Author.find().exec(),
    Genre.find().exec(),
  ]);

  res.render("bookForm", {
    authors: allAuthors,
    genres: allGenres,
    title: "Create Book",
  });
});

exports.bookCreatePost = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const book = new Book({
      author: req.body.author,
      genre: req.body.genre,
      isbn: req.body.isbn,
      summary: req.body.summary,
      title: req.body.title,
    });

    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().exec(),
        Genre.find().exec(),
      ]);

      for (const genre of allGenres) {
        if (book.genre.indexOf(genre._id) > -1) {
          genre.checked = "true";
        }
      }
      res.render("bookForm", {
        authors: allAuthors,
        book,
        errors: errors.array(),
        genres: allGenres,
        title: "Create Book",
      });
    } else {
      await book.save();
      res.redirect(book.url);
    }
  }),
];

exports.bookUpdateGet = asyncHandler(async (req, res, next) => {
  // Fetch all authors & genres in addition to the book matching the id param, then populate the author & genre fields of that book.
  const [authors, book, genres] = await Promise.all([
    Author.find().exec(),
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    Genre.find().exec(),
  ]);

  // Create an error & run it in the next() error middleware if no book can be found as the book MUST exist in order to update it.
  if (!book) {
    const error = new Error("Book not found");
    error.status = 404;
    return next(error);
  }

  // For each genre, check if the genre of the book being updated matches & if it does mark the genre as selected
  for (const genre of genres) {
    if (genre._id.toString() === book.genre._id.toString()) {
      genre.checked = "true";
    }
  }
  // Render the bookForm view
  res.render("bookForm", {
    authors,
    book,
    genres,
    title: "Update Book",
  });
  return true;
});

exports.bookUpdatePost = [
  // Validate & sanitize fields
  body("title", "Title must not be empty").trim().isLength({ min: 1 }).escape(),
  body("author", "Author must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // After validation & sanitization, process request
  asyncHandler(async (req, res, next) => {
    // Check if the validation check contains errors
    const errors = validationResult(req);
    // Create a Book object with the sanitized data and the original ID.
    const book = new Book({
      _id: req.params.id,
      author: req.body.author,
      genre: req.body.genre || "",
      isbn: req.body.isbn,
      summary: req.body.summary,
      title: req.body.title,
    });

    if (errors.isEmpty()) {
      // If there were no errors, update the book as requested & redirect to the book's details page
      const currentBook = await Book.findByIdAndUpdate(req.params.id, book, {});
      res.redirect(currentBook.url);
    } else {
      // Render the form again with the sanitized values & error messages

      // Get all authors & genres for the form's select & options fields
      const [authors, genres] = await Promise.all([
        Author.find().exec(),
        Genre.find().exec(),
      ]);

      // Mark the selected genres as checked
      for (const genre of genres) {
        if (book.genre.toString() === genre.toString()) {
          genre.checked = "true";
        }
      }

      // Render the same view as for the GET method, but with errors this time
      res.render("bookForm", {
        authors,
        book,
        errors: errors.array(),
        genres,
        title: "Update Book",
      });
    }
  }),
];

exports.bookDeleteGet = asyncHandler(async (req, res) => {
  const [book, allBookInstances] = await Promise.all([
    Book.findById(req.params.id).exec(),
    BookInstance.find({ author: req.params.id }, "title summary").exec(),
  ]);
  if (!book) res.redirect("/catalog/books");
  res.render("bookDelete", {
    allBookInstances,
    book,
    title: "Delete Book",
  });
});

exports.bookDeletePost = asyncHandler(async (req, res) => {
  const [book, allBookInstances] = await Promise.all([
    Book.findById(req.params.id).exec(),
    BookInstance.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBookInstances.length > 0) {
    res.render("bookDelete", {
      allBookInstances,
      book,
      title: "Delete Book",
    });
  } else {
    await Book.findByIdAndRemove(req.body.bookID);
    res.redirect("/catalog/books");
  }
});
