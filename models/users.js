const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  name: String,
  address: String,
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  // _id permet de gérer dans le front l'affichage du coeur pour qu'il sache que l'adresse vient des favoris
  // auto: true permet de générer automatiquement un ObjectId pour chaque favori / nécessaire pour l'affichage du coeur rouge
});

const userSchema = mongoose.Schema({
  profilePhoto: String,
  email: { type: String, required: true }, // required : Obligatoire
  lastname: { type: String, required: true },
  firstname: { type: String, required: true },
  password: { type: String, required: true },
  username: String,
  birthdate: Date,
  disability: [String],
  homeAddress: String,
  workAddress: String,
  favorites: [favoriteSchema], // Liste des favoris de l'utilisateur
});

const User = mongoose.model("users", userSchema);

module.exports = User;
