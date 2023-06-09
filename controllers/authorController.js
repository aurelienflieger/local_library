const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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
  res.render("authorForm", { title: "Create Author" });
});

exports.authorCreatePost = [
  body("firstName")
    .trim()
    .isLength({ max: 100, min: 1 })
    .escape()
    .withMessage("First name must be specified")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),
  body("familyName")
    .trim()
    .isLength({ max: 100, min: 1 })
    .escape()
    .withMessage("Family name must be specified")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters"),
  body("dateOfBirth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  asyncHandler(async function validate(req, res) {
    const errors = validationResult(req);
    const author = new Author({
      dateOfBirth: req.body.dateOfBirth,
      dateOfDeath: req.body.dateOfDeath,
      familyName: req.body.familyName,
      firstName: req.body.firstName,
    });

    if (errors.isEmpty()) {
      const existingAuthor = await Author.findOne({
        name: req.body.name,
      }).exec();
      if (existingAuthor) {
        res.redirect(existingAuthor.url);
      } else {
        await author.save();
        res.redirect(author.url);
      }
    } else {
      res.render("authorForm", {
        author,
        errors: errors.array(),
        title: "Create Author",
      });
    }
  }),
];

exports.authorDeleteGet = asyncHandler(async (req, res) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);
  if (!author) res.redirect("/catalog/authors");
  res.render("authorDelete", {
    author,
    authorBooks: allBooksByAuthor,
    title: "Delete Author",
  });
});

exports.authorDeletePost = asyncHandler(async (req, res) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    res.render("authorDelete", {
      author,
      authorBooks: allBooksByAuthor,
      title: "Delete Author",
    });
  } else {
    await Author.findByIdAndRemove(req.body.authorID);
    res.redirect("/catalog/authors");
  }
});

exports.authorUpdateGet = asyncHandler(async (req, res, next) => {
  // Fetch the author instance matching the id param
  const author = await Author.findById(req.params.id).exec();

  // Create an error & run it in the next() error middleware if no author can be found as the author MUST exist in order to update it.
  if (!author) {
    const error = new Error("Author not found");
    error.status = 404;
    return next(error);
  }

  // Render the authorForm view
  res.render("authorForm", {
    author,
    title: "Update Author",
  });
  return true;
});

exports.authorUpdatePost = [
  // Validate & sanitize fields
  body("firstName", "First name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("familyName", "Family name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("dateOfBirth", "Invalid date").optional().isISO8601().toDate(),
  body("dateOfDeath", "Invalid date").optional().isISO8601().toDate(),

  // After validation & sanitization, process request
  asyncHandler(async (req, res) => {
    // Check if the validation check contains errors
    const errors = validationResult(req);
    // Create a Book object with the sanitized data and the original ID.
    const author = new Author({
      _id: req.params.id,
      dateOfBirth: req.body.dateOfBirth,
      dateOfDeath: req.body.dateOfDeath,
      familyName: req.body.familyName,
      firstName: req.body.firstName,
    });

    if (errors.isEmpty()) {
      // If there were no errors, update the book as requested & redirect to the book's details page
      const currentAuthor = await Author.findByIdAndUpdate(
        req.params.id,
        author,
        {}
      );
      res.redirect(currentAuthor.url);
    } else {
      // Render the form again with the sanitized values & error messages

      // Render the same view as for the GET method, but with errors this time
      res.render("authorForm", {
        author,
        title: "Update Author",
      });
      return true;
    }
  }),
];
