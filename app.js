require("dotenv").config();
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const path = require("path");

const catalogRouter = require("./routes/catalog");
const indexRouter = require("./routes/index");

const app = express();

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const mongoDB = process.env.MONGODB;

const main = async function main() {
  await mongoose.connect(mongoDB);
};

main().catch((err) => console.log(err));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));

app.use("/", indexRouter);
app.use("/catalog", catalogRouter);

app.use(function nextFunction(req, res, next) {
  const errorCode = 404;
  next(createError(errorCode));
});

app.use(function renderError(err, req, res) {
  const errorCode = 500;
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || errorCode);
  res.render("error");
});

module.exports = app;
