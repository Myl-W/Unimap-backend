const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  nom: String,
  username: { type: String, required: true },
  password: { type: String, required: true },
  dateNaissance: Date,
  handicap: [String],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
