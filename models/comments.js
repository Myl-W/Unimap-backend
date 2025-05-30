const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    picture: String,
    comment: String,
    // Cela permet de relier un commentaire à un document de la collection 'places'
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "places",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true, // ✅ createdAt et updatedAt ajoutés automatiquement//Pour savoir quand un commentaire a été posté
  }
);

const Comment = mongoose.model("comments", commentSchema);

module.exports = Comment;
