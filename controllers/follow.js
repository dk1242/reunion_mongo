const User = require("../models/userModel");

exports.followUser = (req, res, next) => {
  //   console.log(req.auth);
  //   console.log(req.params);
  let userId = req.auth.user.id,
    userToFollowId = req.params.id;
  if (userId === userToFollowId) {
    return res.send({ msg: "You cannot follow yourself" });
  }
  User.findById(userId, (error, user) => {
    if (error) {
      return res.send({ error });
    }
    console.log(user.following);
    User.findById(userToFollowId, (error, userToFollow) => {
      if (error) {
        console.log(error);
        return res.send({ msg: "There is no user with this user id" });
      }
      if (!userToFollow) {
        return res.send({ msg: "There is no user with this user id" });
      }
      let friend = user.following.find((id) => id == userToFollowId);
      if (friend) {
        return res.send({ msg: "You already follow this user" });
      }
      user.following.push(userToFollowId);
      user.followingCount += 1;
      user.save((err, resp) => {
        userToFollow.followers.push(userId);
        userToFollow.followersCount += 1;
        userToFollow.save((err, resp) => {
          if (err) {
            return res.send(err);
          }
          return res.send({ msg: "user followed" });
        });
      });
    });
  });
};

exports.unfollowUser = (req, res, next) => {
  let userId = req.auth.user.id,
    userTounFollowId = req.params.id;
  if (userId === userTounFollowId) {
    return res.send({ msg: "You cannot follow/unfollow yourself" });
  }
  User.findById(userId, (error, user) => {
    if (error) {
      return res.send({ error });
    }
    // console.log(user.following);
    User.findById(userTounFollowId, (error, userTounFollow) => {
      if (error) {
        console.log(error);
        return res.send({ msg: "There is no user with this user id" });
      }
      if (!userTounFollow) {
        return res.send({ msg: "There is no user with this user id" });
      }
      let friend = user.following.find((id) => id == userTounFollowId);
      if (!friend) {
        return res.send({ msg: "You don't follow this user" });
      }
      var index = user.following.indexOf(userTounFollowId);
      if (index !== -1) {
        user.following.splice(index, 1);
      }
      if (user.followingCount > 0) user.followingCount -= 1;
      user.save((err, resp) => {
        var index = userTounFollow.followers.indexOf(userId);
        if (index !== -1) {
          userTounFollow.followers.splice(index, 1);
        }
        if (userTounFollow.followersCount > 0)
          userTounFollow.followersCount -= 1;
        userTounFollow.save((err, resp) => {
          if (err) {
            return res.send(err);
          }
          return res.send({ msg: "user unfollowed" });
        });
      });
    });
  });
};
