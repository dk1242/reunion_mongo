const express = require("express");
const { followUser, unfollowUser } = require("../controllers/follow");
const {
  SignUp,
  Authenticate,
  requireSignin,
  isAuth,
} = require("../controllers/user");
const router = express.Router();

router.post("/follow/:id", requireSignin, followUser);
router.post("/unfollow/:id", requireSignin, unfollowUser);

module.exports = router;
