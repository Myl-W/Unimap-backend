const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  lastname: String,
  firstname: { type: String, required: true },
  password: { type: String, required: true },
  birthdate: Date,
  disability: [String],
  home_adress: String,
  work_adress: String,
  places: [{ type: mongoose.Schema.Types.ObjectId, ref: "places" }],
  favorites: [String],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
