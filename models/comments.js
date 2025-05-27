const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  picture: String,
  comment: String,
  // Référence au lieu concerné par ce commentaire
  // Cela permet de relier un commentaire à un document de la collection 'places'
  placeId: {
    type: mongoose.Schema.Types.ObjectId, // type ObjectId MongoDB
    ref: 'places'
  },// nom du modèle de référence
}, {
  timestamps: true, // ✅ createdAt et updatedAt ajoutés automatiquement//Pour savoir quand un commentaire a été posté
});

const Comment = mongoose.model("comments", commentSchema);

module.exports = Comment;
