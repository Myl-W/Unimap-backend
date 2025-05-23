const mongoose = require("mongoose");

const placeSchema = mongoose.Schema({
  picture: String,
  signalement: Number,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }],
  latitude: Number,
  longitude: Number,
});

const Place = mongoose.model("places", placeSchema);

module.exports = Place;
