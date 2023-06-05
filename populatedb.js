#! /usr/bin/env node

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Book = require("./models/book");
const Author = require("./models/author");
const Genre = require("./models/genre");
const BookInstance = require("./models/bookInstance");

const genres = [];
const authors = [];
const books = [];
const bookinstances = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const [mongoDB] = userArgs;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB);
  await createGenres();
  await createAuthors();
  await createBooks();
  await createBookInstances();
  mongoose.connection.close();
}

async function genreCreate(name) {
  const genre = new Genre({ name });
  await genre.save();
  genres.push(genre);
  console.log(`Added genre: ${name}`);
}

async function createGenres() {
  console.log("Adding genres");
  await Promise.all([
    genreCreate("Fantasy"),
    genreCreate("Science Fiction"),
    genreCreate("French Poetry"),
  ]);
}

async function authorCreate(firstName, familyName, dateOfBirth, dateOfDeath) {
  const authorDetail = { familyName, firstName };
  if (dateOfBirth !== false) authorDetail.dateOfBirth = dateOfBirth;
  if (dateOfDeath !== false) authorDetail.dateOfDeath = dateOfDeath;

  const author = new Author(authorDetail);

  await author.save();
  authors.push(author);
  console.log(`Added author: ${firstName} ${familyName}`);
}

async function createAuthors() {
  console.log("Adding authors");
  await Promise.all([
    authorCreate("Patrick", "Rothfuss", "1973-06-06", false),
    authorCreate("Ben", "Bova", "1932-11-8", false),
    authorCreate("Isaac", "Asimov", "1920-01-02", "1992-04-06"),
    authorCreate("Bob", "Billings", false, false),
    authorCreate("Jim", "Jones", "1971-12-16", false),
  ]);
}

async function bookCreate(title, summary, isbn, author, genre) {
  const bookDetail = {
    author,
    isbn,
    summary,
    title,
  };
  if (genre !== false) bookDetail.genre = genre;

  const book = new Book(bookDetail);
  await book.save();
  books.push(book);
  console.log(`Added book: ${title}`);
}

async function createBooks() {
  console.log("Adding Books");
  await Promise.all([
    bookCreate(
      "The Name of the Wind (The Kingkiller Chronicle, #1)",
      "I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.",
      "9781473211896",
      authors[0],
      genres[0]
    ),
    bookCreate(
      "The Wise Man's Fear (The Kingkiller Chronicle, #2)",
      "Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.",
      "9788401352836",
      authors[0],
      genres[0]
    ),
    bookCreate(
      "The Slow Regard of Silent Things (Kingkiller Chronicle)",
      "Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.",
      "9780756411336",
      authors[0],
      genres[0]
    ),
    bookCreate(
      "Apes and Angels",
      "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...",
      "9780765379528",
      authors[1],
      genres[1]
    ),
    bookCreate(
      "Death Wave",
      "In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...",
      "9780765379504",
      authors[1],
      genres[1]
    ),
    bookCreate(
      "Test Book 1",
      "Summary of test book 1",
      "ISBN111111",
      authors[4],
      genres[0]
    ),
    bookCreate(
      "Test Book 2",
      "Summary of test book 2",
      "ISBN222222",
      authors[4],
      false
    ),
  ]);
}

async function bookInstanceCreate(book, imprint, dueBack, status) {
  const bookInstanceDetail = {
    book,
    imprint,
  };
  if (dueBack !== false) bookInstanceDetail.dueBack = dueBack;
  if (status !== false) bookInstanceDetail.status = status;

  const bookInstance = new BookInstance(bookInstanceDetail);
  await bookInstance.save();
  bookinstances.push(bookInstance);
  console.log(`Added bookInstance: ${imprint}`);
}

async function createBookInstances() {
  console.log("Adding authors");
  await Promise.all([
    bookInstanceCreate(books[0], "London Gollancz, 2014.", false, "Available"),
    bookInstanceCreate(books[1], " Gollancz, 2011.", false, "Loaned"),
    bookInstanceCreate(books[2], " Gollancz, 2015.", false, false),
    bookInstanceCreate(
      books[3],
      "New York Tom Doherty Associates, 2016.",
      false,
      "Available"
    ),
    bookInstanceCreate(
      books[3],
      "New York Tom Doherty Associates, 2016.",
      false,
      "Available"
    ),
    bookInstanceCreate(
      books[3],
      "New York Tom Doherty Associates, 2016.",
      false,
      "Available"
    ),
    bookInstanceCreate(
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      false,
      "Available"
    ),
    bookInstanceCreate(
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      false,
      "Maintenance"
    ),
    bookInstanceCreate(
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      false,
      "Loaned"
    ),
    bookInstanceCreate(books[0], "Imprint XXX2", false, false),
    bookInstanceCreate(books[1], "Imprint XXX3", false, false),
  ]);
}