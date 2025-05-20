const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  picture: String,
  comment: String,
});

const Comment = mongoose.model("comments", commentSchema);

module.exports = Comment;
