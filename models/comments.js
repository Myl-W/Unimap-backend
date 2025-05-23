const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  picture: String,
  comment: String,
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'places' },
}, {
  timestamps: true, // ✅ createdAt et updatedAt ajoutés automatiquement//Pour savoir quand un commentaire a été posté
});

const Comment = mongoose.model("comments", commentSchema);

module.exports = Comment;
