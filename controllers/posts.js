const pool = require("../pool");

exports.CreatePost = (req, res) => {
  const { title, description } = req.body;
  //   console.log(req.auth);
  let userId = req.auth.user.id;
  pool.query(
    "Insert into posts (postid, title, description, created_by) values (nextval('id_seq'), $1, $2, $3) returning postid, title, description, created_at",
    [title, description, userId],
    (error, resp) => {
      if (error) {
        // console.log(error);
        return res.send({ error: error.detail });
      }
      res.send(resp.rows[0]);
    }
  );
};

exports.GetPost = (req, res) => {
  let userId = req.auth.user.id,
    postId = req.params.id;
  pool.query(
    "Select postid, likes, comments from posts where postid=($1)",
    [postId],
    (error, resp) => {
      if (error) {
        // console.log(error);
        return res.send({ error: error.detail });
      }
      // console.log(resp);
      res.send(resp.rows[0]);
    }
  );
};

exports.AllPosts = async (req, res) => {
  let userId = req.auth.user.id;
  let posts;
  await pool.query(
    "Select postid, title, description, created_at, likes, string_agg(comment, ', ') as comments from posts natural join comments where created_by=($1) group by postid",
    [userId],
    async (error, resp) => {
      if (error) {
        // console.log(error);
        return res.send({ error: error.detail });
      }
      posts = resp.rows;
      return res.status(200).json({ allPosts: posts });
    }
  );
};

exports.AddComment = (req, res) => {
  const { comment } = req.body;
  //   console.log(req.auth);
  let userId = req.auth.user.id;

  pool.query(
    "select * from posts where postid=($1)",
    [req.params.id],
    (err, resp) => {
      if (err) {
        return res.send(err);
      }
      if (resp.rowCount == 0) {
        return res.send({ msg: "There is no post with this post id" });
      }
      let post = resp.rows[0];

      pool.query(
        "Insert into comments (commentId, comment, postId, userId) values (nextval('id_seq'), $1, $2, $3) returning commentId",
        [comment, post.postid, userId],
        (err, resp) => {
          if (err) {
            return res.send(err);
          }
          pool.query(
            "Update posts set comments=($1) where postid=($2)",
            [post.comments + 1, post.postid],
            (err, resp) => {
              if (err) {
                return res.send(err);
              }
            }
          );
          return res.send({
            msg: "comment added",
            "Comment-Id": resp.rows[0].commentid,
          });
        }
      );
    }
  );
};

exports.DeletePost = (req, res) => {
  //   console.log(req.auth);

  let postId = req.params.id;
  pool.query("Delete from posts where postid=($1)", [postId], (error, resp) => {
    if (error) {
      // console.log(error);
      return res.send({ error: error.detail });
    }
    console.log(resp);
    if (resp.rowCount == 0) {
      return res.send({ msg: "post not exists." });
    }
    res.send({ msg: "post deleted" });
  });
};

exports.LikePost = (req, res) => {
  let user, post;
  pool.query(
    "select * from users where userid=($1)",
    [req.auth.user.id],
    (error, results) => {
      if (error) {
        return res.send({ error });
      }
      user = results.rows[0];
      pool.query(
        "select * from posts where postid=($1)",
        [req.params.id],
        (err, resp) => {
          if (err) {
            return res.send(err);
          }
          if (resp.rowCount == 0) {
            return res.send({ msg: "There is no post with this post id" });
          }
          post = resp.rows[0];

          pool.query(
            "select * from likes where postid=($1) and userid=($2)",
            [post.postid, user.userid],
            (err, resp) => {
              if (err) {
                return res.send(err);
              }
              //   console.log(resp.rows.length, resp);
              if (resp.rows.length) {
                return res.send({ msg: "You already liked this post" });
              }

              pool.query(
                "Insert into likes (likeId, postId, userId) values (nextval('id_seq'), $1, $2)",
                [post.postid, user.userid],
                (err, resp) => {
                  if (err) {
                    return res.send(err);
                  }
                  pool.query(
                    "Update posts set likes=($1) where postid=($2)",
                    [post.likes + 1, post.postid],
                    (err, resp) => {
                      if (err) {
                        return res.send(err);
                      }
                      return res.send({ msg: "post liked" });
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

exports.UnlikePost = (req, res) => {
  let user, post;
  pool.query(
    "select * from users where userid=($1)",
    [req.auth.user.id],
    (error, results) => {
      if (error) {
        return res.send({ error });
      }
      user = results.rows[0];
      pool.query(
        "select * from posts where postid=($1)",
        [req.params.id],
        (err, resp) => {
          if (err) {
            return res.send(err);
          }
          if (resp.rowCount == 0) {
            return res.send({ msg: "There is no post with this post id" });
          }
          post = resp.rows[0];

          pool.query(
            "select * from likes where postid=($1) and userid=($2)",
            [post.postid, user.userid],
            (err, resp) => {
              if (err) {
                return res.send(err);
              }
              //   console.log(resp.rows.length, resp);
              if (resp.rows.length === 0) {
                return res.send({ msg: "You didn't liked this post" });
              }

              pool.query(
                "Delete from likes where postid=($1) and userid=($2)",
                [post.postid, user.userid],
                (err, resp) => {
                  if (err) {
                    return res.send(err);
                  }
                  pool.query(
                    "Update posts set likes=($1) where postid=($2)",
                    [post.likes - 1, post.postid],
                    (err, resp) => {
                      if (err) {
                        return res.send(err);
                      }
                      return res.send({ msg: "post unliked" });
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
