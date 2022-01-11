const pool = require("../pool");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.SignUp = (req, res) => {
  const { name, email, password } = req.body;

  pool.query(
    "INSERT INTO users (userId, name, email, password) VALUES (nextval('id_seq'), $1, $2, $3)",
    [name, email, password],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.send({ error: error.detail });
      }
      return res.status(201).json({ msg: "User created", results });
    }
  );
};
exports.Authenticate = (req, res) => {
  const { email, password } = req.body;
  pool.query(
    "select * from users where email=($1)",
    [email],
    (error, results) => {
      if (error) {
        return res.send({ error });
      }
      if (results.rowCount == 1) {
        let user = results.rows[0];
        if (password === user.password) {
          const payload = {
            user: {
              id: user.userid,
            },
          };
          const token = jwt.sign(payload, process.env.JWT_SECRET);
          res.cookie("t", token, { expire: new Date() + 9999 });
          req.profile = user;
          console.log(req.profile);
          return res.json({
            token,
            user,
          });
        }
      } else {
        return res.status(400).json({
          message: "User not exist",
        });
      }
    }
  );
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  console.log(req.profile);
  let user = req.profile && req.auth && req.profile._id == req.auth.user.id;
  if (!user) {
    return res.status(403).json({
      message: "Forbidden access",
    });
  }
  next();
};

exports.read = (req, res) => {
  let user;
  pool.query(
    "select * from users where userid=($1)",
    [req.auth.user.id],
    (error, results) => {
      if (error) {
        return res.send({ error });
      }
      user = results.rows[0];
      return res.send({
        name: user.name,
        followers: user.followers,
        following: user.following,
      });
    }
  );
};
