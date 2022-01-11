const express = require("express");
const {
  CreatePost,
  DeletePost,
  LikePost,
  UnlikePost,
  AddComment,
  GetPost,
  AllPosts,
} = require("../controllers/posts");
const {
  SignUp,
  Authenticate,
  requireSignin,
  read,
} = require("../controllers/user");
const router = express.Router();

router.post("/posts", requireSignin, CreatePost);
router.post("/like/:id", requireSignin, LikePost);
router.post("/unlike/:id", requireSignin, UnlikePost);
router.post("/comment/:id", requireSignin, AddComment);
router.get("/posts/:id", requireSignin, GetPost);
router.get("/all_posts", requireSignin, AllPosts);
router.delete("/posts/:id", requireSignin, DeletePost);

module.exports = router;
