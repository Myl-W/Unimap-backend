const mongoose = require("mongoose");

const placeSchema = mongoose.Schema({
  pictures: [String],
  signalement: Number,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }],
});

const Place = mongoose.model("places", placeSchema);

module.exports = Place;
