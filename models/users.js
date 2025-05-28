const mongoose = require("mongoose");

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
  favorites: [String],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
