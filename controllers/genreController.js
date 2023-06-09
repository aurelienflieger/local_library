const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

exports.genreCreateGet = (req, res) => {
  res.render("genreForm", { title: "Create Genre" });
};

exports.genreCreatePost = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });
    if (errors.isEmpty()) {
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    } else {
      res.render("genreForm", {
        errors: errors.array(),
        genre,
        title: "Create Genre",
      });
    }
  }),
];

exports.genreDeleteGet = asyncHandler(async (req, res) => {
  const [genre, allBooksByGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (!genre) res.redirect("/catalog/genres");
  res.render("genreDelete", {
    allBooksByGenre,
    genre,
    title: "Delete Genre",
  });
});

exports.genreDeletePost = asyncHandler(async (req, res) => {
  const [genre, allBooksByGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByGenre.length > 0) {
    res.render("genreDelete", {
      allBooksByGenre,
      genre,
      title: "Delete Genre",
    });
  } else {
    await Genre.findByIdAndRemove(req.body.genreID);
    res.redirect("/catalog/genres");
  }
});

exports.genreUpdateGet = asyncHandler(async (req, res, next) => {
  // Fetch the genre matching the id param
  const genre = await Genre.findById(req.params.id).exec();

  // Create an error & run it in the next() error middleware if no genre can be found as the genre MUST exist in order to update it.
  if (!genre) {
    const error = new Error("Genre not found");
    error.status = 404;
    return next(error);
  }

  // Render the bookInstanceForm view
  res.render("genreForm", {
    genre,
    title: "Update Genre",
  });
  return true;
});

exports.genreUpdatePost = [
  // Validate & sanitize fields
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),

  // After validation & sanitization, process request
  asyncHandler(async (req, res) => {
    // Check if the validation check contains errors
    const errors = validationResult(req);
    // Create a Genre object with the sanitized data and the original ID.
    const genre = new Genre({
      _id: req.params.id,
      name: req.body.name,
    });

    if (errors.isEmpty()) {
      // If there were no errors, update the genre as requested & redirect to the current genre's page
      const currentGenre = await Genre.findByIdAndUpdate(
        req.params.id,
        genre,
        {}
      );
      res.redirect(currentGenre.url);
    } else {
      // Render the form again with the sanitized values & error messages

      // Render the same view as for the GET method, but with errors this time
      res.render("bookInstanceForm", {
        errors: errors.array(),
        genre,
        title: "Update Genre",
      });
    }
  }),
];
