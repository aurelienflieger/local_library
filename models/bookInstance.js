const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const bookInstanceModel = {
  book: { ref: "Book", required: true, type: mongoose.Schema.Types.ObjectId },
  dueBack: { default: Date.now(), type: Date },
  imprint: { required: true, type: String },
  status: {
    default: "Maintenance",
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    required: true,
    type: String,
  },
};

const BookInstanceSchema = new mongoose.Schema(bookInstanceModel);

BookInstanceSchema.virtual("url").get(function url() {
  return `/catalog/bookInstance/${this._id}`;
});

BookInstanceSchema.virtual("dueBackFormatted").get(function getDate() {
  return DateTime.fromJSDate(this.dueBack).toLocaleString(
    DateTime.DATETIME_SHORT
  );
});

module.exports = mongoose.model("BookInstance", BookInstanceSchema);
