// how many milliseconds are authorization codes valid for
const AUTH_EXPIRE = 600 * 1000;

// how many milliseconds are access tokens valid for
const ACCESS_EXPIRE = 3600 * 1000;

// defined in db.sql
const REDIR_MAX_LEN = 128;

const express = require("express");
const cors = require("cors");
const body_parser = require("body-parser");
const app = express();
app.use(cors());
app.use(body_parser.urlencoded({extended: true}));

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
/*
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
*/

/*
  checks that $body contains all strings in $params
  if not, return missing parameter
*/
function param_missing(body, params) {
  for (const param of params) {
    if (param in body === false)
      return param;
  }
  return false;
}

// endpoint for new client creation
app.get("/api/new_client", (req, res) => {
  const t = Date.now().toString();
  const h = hash(t);
  DB.insert_client(h)
    .then( () => res.send({client_id: h}) )
    .catch( () => res.status(500).send("internal server error") );
});

// endpoint for authorization code granting
app.get("/api/auth", (req, res) => {
  const query = req.query;

  const missing = param_missing(query, ["client_id", "redirect_uri"]);
  if (missing !== false) {
    res.send(`${missing} missing`);
    return;
  }


  const client_id = query.client_id;
  const redirect = query.redirect_uri;
  // limit allowing arbitrary length uris in the database
  if (redirect.length > REDIR_MAX_LEN) {
    res.redirect(`${redirect}?error=invalid_request`);
    return;
  }

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

      // use sha256(Math.random() + url) as the code
      const m = `${Math.random()}${req.url}`;
      const code = hash(m);
      const expire = Date.now() + AUTH_EXPIRE;
      DB.insert_auth(code, client_id, redirect, expire)
        .then( () => res.redirect(`${redirect}?code=${code}`) )
        .catch( () => res.redirect(`${redirect}?error=server_error`) );
    })
    .catch( () => res.redirect(`${redirect}?error=server_error`) );
});

// endpoint for access token granting
app.post("/api/token", (req, res) => {
  const body = req.body;

  const required = ["redirect_uri", "client_id", "grant_type", "code"];
  const missing = param_missing(body, required);
  if (missing !== false) {
    res.json({error: `${missing} missing from request`});
    return;
  }

  if (body.grant_type !== "authorization_code") {
    res.json({error: "invalid grant_type"});
    return;
  }

  const client_id = body.client_id;
  const redirect = body.redirect_uri;
  const code = body.code;

  DB.auth_ok(client_id, redirect, code)
    .then(expire_time => {
      if (expire_time === false) {
        res.json({error: "invalid credentials"});
        return;
      }

      if (Date.now() > expire_time) {
        res.json({error: "expired authorization code"});
        return;
      }

      var m = `${Math.random()}${client_id}`;
      const token = hash(m);

      m = `${Math.random()}${code}`;
      const refresh = hash(m);

      const expires = Date.now() + ACCESS_EXPIRE;

      DB.insert_access(token, refresh, expires)
        .then( () => {
          res.json({
            access_token: token,
            token_type: "Bearer",
            expires_in: expires,
            refresh_token: refresh
          });
        })
        .catch( () => res.json({error: "server error"}) );
    })
    .catch( () => res.json({error: "server error"}) );
});

app.listen(8080);
