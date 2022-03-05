const Post = require("../models/postModel");
const User = require("../models/userModel");
const Like = require("../models/LikeModel");
const Comment = require("../models/CommentModel");

exports.CreatePost = (req, res) => {
  const { title, description } = req.body;
  //   console.log(req.auth);
  let userId = req.auth.user.id;
  let post = new Post({ title, description, author: userId });
  post.save((err, resp) => {
    if (err) {
      // console.log("abc", err);
      var error = errorHandler(err);
      if (!error) error = "Problem in creating the account";
      // console.log("a", error);
      return res.status(400).json({
        error,
      });
    }
    res.send(resp);
  });
};

exports.GetPost = (req, res) => {
  let userId = req.auth.user.id,
    postId = req.params.id;
  Post.findById(postId, (err, post) => {
    if (err) {
      return res.json({ err });
    }
    res.send({
      id: post._id,
      likes: post.likes,
      comments: post.comments.length,
    });
  });
};

exports.AllPosts = async (req, res) => {
  let userId = req.auth.user.id;
  let posts;
  Post.find(
    { author: userId },
    {
      updatedAt: 0,
      author: 0,
      __v: 0,
      "comments.commentId": 0,
      "comments._id": 0,
    },
    (err, posts) => {
      if (err) {
        // console.log(error);
        return res.send({ error: err });
      }
      return res.status(200).send({ allPosts: posts });
    }
  );
};

exports.AddComment = (req, res) => {
  const { comment } = req.body;
  //   console.log(req.auth);
  let userId = req.auth.user.id;
  let postId = req.params.id;
  Post.findById(postId, (err, post) => {
    if (err) {
      return res.send({ msg: "There is no post with this post id" });
    }
    if (!post) {
      return res.send({ msg: "There is no post with this post id" });
    }
    let commentTo = new Comment({ comment, post: postId, user: userId });
    commentTo.save((err, comment) => {
      if (err) {
        return res.send(err);
      }
      post.comments.push({ commentId: comment._id, comment: comment.comment });
      post.save((err, resp) => {
        if (err) return res.send(err);
        res.send({
          msg: "comment added",
          "Comment-Id": resp._id,
        });
      });
    });
  });
};

exports.DeletePost = (req, res) => {
  //   console.log(req.auth);

  let postId = req.params.id;
  Post.findByIdAndDelete(postId, (err, deletedPost) => {
    if (err) return res.send({ err });
    // console.log(deletedPost);
    if (!deletedPost) {
      return res.send("Post doesnt exist. Already deleted");
    }
    Comment.deleteMany({ post: postId }, (err, resp) => {
      if (err) {
        return res.send(err);
      }
      res.send({ msg: "Post deleted" });
    });
  });
};

exports.LikePost = (req, res) => {
  let userId = req.auth.user.id,
    postId = req.params.id;
  Post.findById(postId, (err, post) => {
    if (err) {
      return res.send(err);
    }
    if (!post) {
      return res.send({ msg: "There is no post with this post id" });
    }
    Like.find({ post: postId, user: userId }, (err, liked) => {
      if (err) {
        return res.send(err);
      }
      // console.log(liked);
      if (liked.length > 0) {
        return res.send({ msg: "You already liked this post" });
      }
      let newLike = new Like({ post: postId, user: userId });
      newLike.save((err, likeEntry) => {
        if (err) {
          return res.send(err);
        }
        post.likes += 1;
        post.save((err, resp) => {
          if (err) return res.send(err);
          res.send({ msg: "post liked" });
        });
      });
    });
  });
};

exports.UnlikePost = (req, res) => {
  let userId = req.auth.user.id,
    postId = req.params.id;
  Post.findById(postId, (err, post) => {
    if (err) {
      return res.send(err);
    }
    if (!post) {
      return res.send({ msg: "There is no post with this post id" });
    }
    Like.find({ post: postId, user: userId }, (err, liked) => {
      if (err) {
        return res.send(err);
      }
      if (liked.length == 0) {
        return res.send({ msg: "You didn't liked this post" });
      }
      Like.deleteOne({ post: postId, user: userId }, (err, resp) => {
        if (err) {
          return res.send(err);
        }
        post.likes -= 1;
        post.save((err, resp) => {
          if (err) return res.send(err);
          res.send({ msg: "post unliked" });
        });
      });
    });
  });
};
