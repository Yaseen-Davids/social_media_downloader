const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const puppeteer = require("puppeteer");

// Routes
const indexRouter = require("./routes/index");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("ui/build"));

  app.get("/", (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "ui", "build", "index.html"));
  });
}

app.use(async function (req, res, next) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--no-first-run", "--no-zygote", "--disable-gpu", "--start-maximized"],
    headless: true,
  });
  req.puppeteerContext = browser;
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get("env") === "development" ? err : {};
  // res.render("error");

  res.setHeader("message", err.message);
  res.status(err.status || 500);
  return res.end();
});

module.exports = app;
