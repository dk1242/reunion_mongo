const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },

    comments: [
      {
        commentId: { type: mongoose.Types.ObjectId, ref: "comment" },
        comment: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
