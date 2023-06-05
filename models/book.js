const mongoose = require("mongoose");

const bookModel = {
  author: {
    ref: "Author",
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  genre: { ref: "Genre", type: mongoose.Schema.Types.ObjectId },
  isbn: { required: true, type: String },
  summary: { required: true, type: String },
  title: { required: true, type: String },
};

const BookSchema = new mongoose.Schema(bookModel);

BookSchema.virtual("url").get(function url () {
  return `/catalog/book/${this._id}`;
});

module.exports = mongoose.model("Book", BookSchema);
