const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const authorModel = {
  dateOfBirth: { type: Date },
  dateOfDeath: { type: Date },
  familyName: { maxLength: 100, required: true, type: String },
  firstName: { maxLength: 100, required: true, type: String },
};

const AuthorSchema = new mongoose.Schema(authorModel);

AuthorSchema.virtual("name").get(function name() {
  const fullName =
    this.firstName && this.familyName
      ? `${this.familyName}, ${this.firstName}`
      : "unnamed author";
  return fullName;
});

AuthorSchema.virtual("url").get(function url() {
  return `/catalog/author/${this.id}`;
});

AuthorSchema.virtual("lifespan").get(function getDate() {
  const formattedDateOfBirth = this.dateOfBirth
    ? DateTime.fromJSDate(this.dateOfBirth).toLocaleString(DateTime.DATE_MED)
    : false;
  const formattedDateOfDeath = this.dateOfDeath
    ? DateTime.fromJSDate(this.dateOfDeath).toLocaleString(DateTime.DATE_MED)
    : "unknown";
  if (formattedDateOfBirth) {
    return `${formattedDateOfBirth} - ${formattedDateOfDeath}`;
  }
  return "unknown lifespan";
});

AuthorSchema.virtual("dateOfBirthForm").get( () => 
  DateTime.fromJSDate(this.dateOfBirth).toISODate()
);

AuthorSchema.virtual("dateOfDeathForm").get( () => 
  DateTime.fromJSDate(this.dateOfDeathForm).toISODate()
);


module.exports = mongoose.model("Author", AuthorSchema);
