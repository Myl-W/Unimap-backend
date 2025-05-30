require("dotenv").config();
require("./models/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Importation des routes
var usersRouter = require("./routes/users");
var placesRouter = require("./routes/places");
var commentsRouter = require("./routes/comments");

var app = express();

// Cors (Cross-Origin Resource Sharing) pour autoriser les requêtes depuis d'autres origines
const cors = require("cors");
app.use(cors());

// Envoi de fichiers
const fileUpload = require("express-fileupload");
app.use(fileUpload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Utilisation des routes
app.use("/", usersRouter);
app.use("/", placesRouter);
app.use("/comments", commentsRouter);

module.exports = app;
