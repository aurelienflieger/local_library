const mongoose = require("mongoose");

const genreModel = {
  name: { maxLength: 100, minLength: 3, required: true, type: String },
};

const GenreSchema = new mongoose.Schema(genreModel);

GenreSchema.virtual("url").get(function url() {
  return `/catalog/genre/${this.id}`;
});

module.exports = mongoose.model("Genre", GenreSchema);
