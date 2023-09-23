const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let poi = ""; // Initialize the poi variable

app.post("/", (req, res) => {
  poi = req.body.labelPoi;
  res.redirect("/");
});

app.get("/getPoi", (req, res) => {
  res.json({ poi });
});

app.listen(3000, () => {
  console.log("Server is running");
});