const express = require("express");
const pool = require("./pool");
const app = express();
const cookieParser = require("cookie-parser");

require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const followRoutes = require("./routes/followRoutes");
const postRoutes = require("./routes/postRoutes");

app.use(express.json());
app.use(cookieParser());
app.set("pool", pool);
app.get("/test", (req, res, next) => {
  // console.log("TEST DATA :");
  // pool.query("Select * from test").then((testData) => {
  //   console.log(testData);
  //   res.send(testData.rows);
  // });
  res.send("working");
});
app.use("/api", userRoutes);
app.use("/api", followRoutes);
app.use("/api", postRoutes);

const port = process.env.PORT;
const server = app.listen(port, function () {
  console.log(`server running on `, port);
});
