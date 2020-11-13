// how many milliseconds are authorization codes valid for
const AUTH_EXPIRES = 600 * 1000;

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

app.get("/redir", (req, res) => {
  if ("code" in req.query === false)
  {
    res.redirect("/");
    return;
  }

  const code = req.query.code;
  res.send(`authorization code is: <input type="text" value="${code}" readonly/> </br>
            <a href="/">Go home</a>`);
});

app.get("/api/new_client", (req, res) => {
  const t = Date.now().toString();
  const h = hash(t);
  pool.query(
      "INSERT INTO Client VALUES (?)",
      [ h ]
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
  const query = req.query;

  if ("client_id" in query === false) {
    res.send("client_id missing");
  }
  const client_id = query.client_id;

  pool.query(
    "SELECT client_id FROM Client WHERE client_id=?",
    [ client_id ]
  )
    .then(rows => {
      if (rows.length == 0) {
        res.send("invalid client_id");
        return;
      }

      if ("redirect_uri" in query === false) {
        res.send("redirect_uri missing");
      }
      const redirect = query.redirect_uri;

      // verify uri is valid

      if ("response_type" in query === false
          || query.response_type !== "code") {
        res.redirect(`${redirect}?error=invalid_request`);
        return;
      }

      // use sha256(time + url) as the code
      const m = `${Date.now()}${req.url}`;
      const code = hash(m);
      const expires = Date.now() + AUTH_EXPIRES;

      pool.query(
        "INSERT INTO Auth VALUES (?, ?, ?)",
        [ code, client_id, expires ]
      )
        .then(result => {
          console.log(result);
          res.redirect(`${redirect}?code=${code}`);
        })
        .catch(err => {
          throw err;
        });
    })
    .catch(err => {
      throw err;
    });
});

app.listen(8080);
