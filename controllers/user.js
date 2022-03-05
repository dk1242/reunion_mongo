const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/dbErrorHandler");
const expressJwt = require("express-jwt");

exports.SignUp = (req, res) => {
  const { name, email, password } = req.body;
  if (name == "") {
    return res.send("Please write name");
  }
  if (email == "") {
    return res.send("Please write email");
  }
  if (password == "") {
    return res.send("Please write password");
  }
  User.findOne(email, (err, user) => {
    if (user) {
      return res.status(400).json({ msg: "user already exists" });
    }
    user = new User({
      name,
      email,
      password,
    });
    // console.log(user);
    user.save((err, user) => {
      if (err) {
        // console.log("abc", err);
        var error = errorHandler(err);
        if (!error) error = "Problem in creating the account";
        // console.log("a", error);
        return res.status(400).json({
          error,
        });
      }

      return res.json({
        user,
      });
      // res.json({
      //   user,
      // });
    });
  });
};
exports.Authenticate = (req, res) => {
  const { email, password } = req.body;

  if (email == "") {
    return res.send("Please write email");
  }
  if (password == "") {
    return res.send("Please write password");
  }
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup",
      });
    }
    // console.log(user);
    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(400).json({
        error: "Incorrect Password !",
      });
    }
    const payload = {
      user: {
        id: user._id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie("t", token, { expire: new Date() + 9999 });
    return res.json({ token });
  });
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
  let userId = req.auth.user.id;
  User.findById(userId, (error, user) => {
    if (error) {
      return res.send({ error });
    }
    // console.log(user);
    return res.send({
      name: user.name,
      followers: user.followersCount,
      following: user.followingCount,
    });
  });
};
