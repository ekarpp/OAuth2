const mariadb = require("mariadb");

module.exports =  class DB {
  constructor(info) {
    this.pool = mariadb.createPool(info);
  }

  error_handler(err) {
    console.log(err);
    return Promise.reject("database error");
  }

  insert_client(client_id) {
    return this.pool.query("INSERT INTO Client(client_id) VALUES (?)", [ client_id ])
      .catch(this.error_handler);
  }

  insert_auth(code, id, redirect, expire) {
    const qr = "INSERT INTO Auth(code, client_id, redirect_uri, expires) VALUES (?, ?, ?, ?)";
    return this.pool.query(qr, [ code, id, redirect, expire ])
      .catch(this.error_handler);
  }

  exists_client(client_id) {
    return this.pool.query("SELECT client_id FROM Client WHERE client_id=?", [ client_id ])
      .then(rows => {return Promise.resolve(rows.length == 1)})
      .catch(this.error_handler);
  }

  auth_ok(client_id, redirect, code) {
    const qr = "SELECT expires FROM Auth WHERE code=? AND client_id=? AND redirect_uri=?";
    return this.pool.query(qr, [ code, client_id, redirect ])
      .then(rows => {return Promise.resolve(rows.length === 1 ? rows[0] : false)})
      .catch(this.error_handler);
  }

  insert_access(token, refresh, expire) {
    const qr = "INSERT INTO Access(token, refresh, expires) VALUES (?, ?, ?)";
    return this.pool.query(qr, [ token, refresh, expire ])
      .catch(this.error_handler);
  }
}
