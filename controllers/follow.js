const pool = require("../pool");

exports.followUser = (req, res, next) => {
  //   console.log(req.auth);
  //   console.log(req.params);
  let user, userToFollow;
  pool.query(
    "select * from users where userid=($1)",
    [req.auth.user.id],
    (error, results) => {
      if (error) {
        return res.send({ error });
      }
      user = results.rows[0];
      pool.query(
        "select * from users where userid=($1)",
        [req.params.id],
        (err, resp) => {
          if (err) {
            return res.send(err);
          }
          if (resp.rowCount == 0) {
            return res.send({ msg: "There is no user with this user id" });
          }
          userToFollow = resp.rows[0];
          if (user.userid === userToFollow.userid) {
            return res.send({ msg: "You cannot follow yourself" });
          }
          pool.query(
            "select * from follow where followerId=($1) and followingId=($2)",
            [user.userid, userToFollow.userid],
            (err, resp) => {
              if (err) {
                return res.send(err);
              }
              //   console.log(resp.rows.length, resp);
              if (resp.rows.length) {
                return res.send({ msg: "You already follow this user" });
              }

              pool.query(
                "Insert into follow (followId, followerId, followingId) values (nextval('follow_seq'), $1, $2)",
                [user.userid, userToFollow.userid],
                (err, resp) => {
                  if (err) {
                    return res.send(err);
                  }
                  pool.query(
                    "Update users set following=($1) where userid=($2)",
                    [user.following + 1, user.userid],
                    (err, resp) => {
                      if (err) {
                        return res.send(err);
                      }
                      pool.query(
                        "Update users set followers=($1) where userid=($2)",
                        [userToFollow.followers + 1, userToFollow.userid],
                        (err, resp) => {
                          if (err) {
                            return res.send(err);
                          }
                          return res.send({ msg: "user followed" });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

exports.unfollowUser = (req, res, next) => {
  //   console.log(req.auth);
  //   console.log(req.params);
  let user, userTounFollow;
  pool.query(
    "select * from users where userid=($1)",
    [req.auth.user.id],
    (error, results) => {
      if (error) {
        return res.send({ error });
      }
      user = results.rows[0];
      pool.query(
        "select * from users where userid=($1)",
        [req.params.id],
        (err, resp) => {
          if (err) {
            return res.send(err);
          }
          if (resp.rowCount == 0) {
            return res.send({ msg: "There is no user with this user id" });
          }
          userTounFollow = resp.rows[0];
          if (user.userid === userTounFollow.userid) {
            return res.send({ msg: "You cannot unfollow yourself" });
          }
          pool.query(
            "select * from follow where followerId=($1) and followingId=($2)",
            [user.userid, userTounFollow.userid],
            (err, resp) => {
              if (err) {
                return res.send(err);
              }
              //   console.log(resp.rows.length, resp);
              if (resp.rowCount == 0) {
                return res.send({ msg: "You didn't follow this user" });
              }

              pool.query(
                "Delete from follow where followerId=($1) and followingId=($2)",
                [user.userid, userTounFollow.userid],
                (err, resp) => {
                  if (err) {
                    return res.send(err);
                  }
                  pool.query(
                    "Update users set following=($1) where userid=($2)",
                    [user.following - 1, user.userid],
                    (err, resp) => {
                      if (err) {
                        return res.send(err);
                      }
                      pool.query(
                        "Update users set followers=($1) where userid=($2)",
                        [userTounFollow.followers - 1, userTounFollow.userid],
                        (err, resp) => {
                          if (err) {
                            return res.send(err);
                          }
                          return res.send({ msg: "user unfollowed" });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
