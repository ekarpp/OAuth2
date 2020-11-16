// how many milliseconds are authorization codes valid for
const AUTH_EXPIRE = 600 * 1000;

const express = require("express");
const app = express();

const crypto = require("crypto");

const dbi = require("./db.js");
const DB = new dbi({
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
  const base = '</br> <a href="/">Go home</a>';
  if ("code" in req.query) {
    const code = req.query.code;
    res.send(`authorization code is: <input type="text" value="${code}" readonly/> ${base}`);
  } else if ("error" in req.query) {
    const err = req.query.error.replace("_", " ");
    res.send(`request failed because: ${err} ${base}`);
  } else {
    res.redirect("/");
  }
});

app.get("/api/new_client", (req, res) => {
  const t = Date.now().toString();
  const h = hash(t);
  DB.insert_client(h)
    .then( () => res.send({client_id: h}) )
    .catch( () => res.status(500).send("internal server error") );
});

app.get("/auth", (req, res) => {
  const query = req.query;

  if ("client_id" in query === false) {
    res.send("client_id missing");
  }
  const client_id = query.client_id;

  if ("redirect_uri" in query === false) {
    res.send("redirect_uri missing");
  }
  const redirect = query.redirect_uri;

  // TODO: verify redirect is valid URI

  DB.exists_client(client_id)
    .then(exists => {
      if (exists === false) {
        res.send("invalid client_id");
        return;
      }

      if ("response_type" in query === false
          || query.response_type !== "code") {
        res.redirect(`${redirect}?error=invalid_request`);
        return;
      }

      // use sha256(time + url) as the code
      const m = `${Date.now()}${req.url}`;
      const code = hash(m);
      const expire = Date.now() + AUTH_EXPIRE;
      DB.insert_auth(code, client_id, expire)
        .then( () => res.redirect(`${redirect}?code=${code}`) )
        .catch( () => res.redirect(`${redirect}?error=server_error`) );
    })
    .catch( () => res.redirect(`${redirect}?error=server_error`) );
});

app.listen(8080);
