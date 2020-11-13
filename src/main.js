const express = require("express");
const app = express();

const crypto = require("crypto");

const mariadb = require("mariadb");
const pool = mariadb.createPool({
  host: "db",
  user: "node",
  password: "node",
  database: "node",
  connectionLimit: 5
});

function hash(m) {
  const h = crypto.createHash("sha256");
  h.update(m)
  return h.digest("hex")
}

app.get("/", (req, res) => {
  res.sendFile("index.html", {root: __dirname});
});

app.get("/api/new_client", (req, res) => {
  const t = (new Date).getTime().toString();
  const h = hash(t);
  pool.query(
      "INSERT INTO Client VALUES (?)",
      [h]
    )
    .then(result => {
      console.log(result);
      res.send({client_id: h});
    })
    .catch(err => {
      throw err;
    });
});

app.get("/auth", (req, res) => {
  res.send("AUTH")
});

app.listen(8080);
