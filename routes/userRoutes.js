const express = require("express");
const {
  SignUp,
  Authenticate,
  requireSignin,
  read,
} = require("../controllers/user");
const router = express.Router();

router.post("/signup", SignUp);
router.post("/authenticate", Authenticate);
router.get("/user", requireSignin, read);

module.exports = router;
