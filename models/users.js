const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  name: String,
  address: String,
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
});

const userSchema = mongoose.Schema({
  profilePhoto: String,
  email: { type: String, required: true },
  lastname: String,
  firstname: { type: String, required: true },
  password: { type: String, required: true },
  username: String,
  birthdate: Date,
  disability: [String],
  homeAddress: String,
  workAddress: String,
  places: [{ type: mongoose.Schema.Types.ObjectId, ref: "places" }],
  favorites: [favoriteSchema],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
