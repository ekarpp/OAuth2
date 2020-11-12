const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.sendFile("index.html", {root: __dirname});
});

app.get("/auth", (req, res) => {
  res.send("AUTH")
});

app.listen(8080);
